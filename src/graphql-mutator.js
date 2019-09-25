/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import COMPONENT_IMAGE from '../assets/no-image.png'
import gql from 'graphql-tag'
import { Component, DataSource, RectPath, Shape } from '@hatiolab/things-scene'

const SELF = function(o) {
  return o
}

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'string',
      label: 'client',
      name: 'client'
    },
    {
      type: 'textarea',
      label: 'update-gql',
      name: 'updateGql'
    }
  ]
}

export default class GraphqlMutator extends DataSource(RectPath(Shape)) {
  static get image() {
    if (!GraphqlMutator._image) {
      GraphqlMutator._image = new Image()
      GraphqlMutator._image.src = COMPONENT_IMAGE
    }

    return GraphqlMutator._image
  }

  get nature() {
    return NATURE
  }

  onchange(after, before) {
    var changed = after.data || after.value
    if (changed) {
      var dirtyData = changed.original || changed.records.original
      if (dirtyData && dirtyData.length > 0) {
        this.requestData(dirtyData)
      }
    }
  }

  dispose() {
    super.dispose()

    try {
      this._client && this._client.end(true, () => {})
    } catch (e) {
      console.error(e)
    }
    delete this._client
  }

  render(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(GraphqlMutator.image, left, top, width, height)
  }

  ready() {
    super.ready()
  }

  async requestData(dirtyData) {
    var { client, updateGql } = this.state
    var convertAsGql = this.convertData(dirtyData)
    if (client && convertAsGql) {
      this.client = this.root.findById(client).client
      updateGql = updateGql.replace('#{update}', convertAsGql)
      var response = await this.client.query({
        query: gql`
          ${updateGql}
        `
      })
      console.log('response', response)
    }
  }

  convertData(dirtyData) {
    var convertedGql = '['
    for (var i = 0; i < dirtyData.length; i++) {
      var dirtyDataField = dirtyData[i]
      var dirtyDataObject = {}
      for (var property in dirtyDataField) {
        if (!property.indexOf('__') == 0) {
          dirtyDataObject[property] = dirtyDataField[property]
        }
        if (property == '__dirty__') {
          dirtyDataObject.cuFlag = dirtyDataField[property]
        }
      }
      if (i != 0) {
        convertedGql += ','
      }
      convertedGql +=
        Object.entries(dirtyDataObject)
          .reduce((a, e) => {
            if (typeof e[1] != 'function') {
              a += `${e[0]} : "${e[1]}", `
            }
            return a
          }, '`{')
          .slice(1, -2) + '}'
    }
    convertedGql += ']'
    return convertedGql
  }
}

Component.register('graphql-mutator', GraphqlMutator)
