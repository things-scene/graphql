/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import COMPONENT_IMAGE from '../assets/symbol-graphql-mutator.png'
import gql from 'graphql-tag'
import { gqlBuilder } from './utils/graphql'
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
      type: 'id-input',
      label: 'client',
      name: 'client',
      property: {
        component: 'graphql-client' // component의 type (null or undefined이면 모든 컴포넌트)
      }
    },
    {
      type: 'textarea',
      label: 'update-gql',
      name: 'updateGql'
    },
    {
      type: 'string',
      name: 'value',
      hidden: true
    }
  ],
  'value-property': 'value'
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

  onchange(after) {
    if (after.value + '') {
      this.requestData()
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

  async requestData() {
    if (!this.app.isViewMode) return
    var { client, updateGql } = this.state

    if (client) {
      let component = this.root.findById(client)
      this.client = component.client
      if (!this.client) return
    }

    var mutation = (Component.buildSubstitutor(updateGql, this) || (() => updateGql))()
    try {
      mutation = mutation.replace(/\(.*\)/gi, params => {
        let paramObject = eval(`({${params.slice(1, -1)}})`)
        return '(' + gqlBuilder.buildArgs(paramObject) + ')'
      })
    } catch (e) {
      console.log(e)
    }

    this.data = await this.client.query({
      query: gql`
        ${mutation}
      `
    })
  }
}

Component.register('graphql-mutator', GraphqlMutator)
