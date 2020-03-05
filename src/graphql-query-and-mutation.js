/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import COMPONENT_IMAGE_QUERY from '../assets/symbol-graphql-query.png'
import COMPONENT_IMAGE_MUTATION from '../assets/symbol-graphql-mutation.png'
import gql from 'graphql-tag'
import { gqlBuilder } from './utils/graphql'
import { Component, DataSource, RectPath, Shape } from '@hatiolab/things-scene'

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
      type: 'number',
      label: 'period',
      name: 'period',
      placeholder: 'SECONDS'
    },
    {
      type: 'textarea',
      label: 'query',
      name: 'query'
    },
    {
      type: 'checkbox',
      label: 'auto-start',
      name: 'autoStart'
    }
  ],
  'value-property': 'value'
}

class GraphQLQuery extends DataSource(RectPath(Shape)) {
  get nature() {
    return NATURE
  }

  onchange(after) {
    if ('value' in after) {
      if (after.value) this.requestData()
    }
  }

  get period() {
    return this.state.period * 1000
  }

  set period(period) {
    this.setState('period', period)
    this._initGraphqlQuery()
  }

  get repeatTimer() {
    return this._repeatTimer
  }

  set repeatTimer(repeatTimer) {
    this._stopRepeater()
    this._repeatTimer = repeatTimer
  }

  get autoStart() {
    return this.state.autoStart
  }

  set autoStart(autoStart) {
    this.setState('autoStart', autoStart)
  }

  get query() {
    var _query = this.state.query
    var objToVal = exp => {
      if (typeof exp === 'string') return exp
      else return JSON.stringify(exp)
    }
    var changedQuery = (Component.buildSubstitutor(_query, this, objToVal) || (() => _query))()
    try {
      changedQuery = changedQuery.replace(/\(.*\)/gi, params => {
        let paramObject = eval(`({${params.slice(1, -1)}})`)
        return '(' + gqlBuilder.buildArgs(paramObject) + ')'
      })
    } catch (e) {
      console.log(e)
    }

    return changedQuery
  }

  get source() {
    return this.getState('source')
  }

  set source(source) {
    this.setState('source', source)
  }

  dispose() {
    super.dispose()
    this._stopRepeater()
  }

  static get image() {}

  render(context) {}

  ready() {
    super.ready()
    if (this.autoStart) {
      this._initGraphqlQuery()
    }
  }

  _initGraphqlQuery() {
    if (!this.app.isViewMode) return

    this._stopRepeater()
    this._startRepeater()
  }

  _stopRepeater() {
    if (this.repeatTimer) clearTimeout(this._repeatTimer)
    this._isStarted = false
  }

  _startRepeater() {
    this._isStarted = true

    // requestAnimationFrame 이 호출되지 않을 때는 requestData 호출도 하지 않도록 함.
    var _ = () => {
      if (!this._isStarted) {
        return
      }
      this.requestData()
      if (!Number.isNaN(this.period) && this.period > 0) {
        this._repeatTimer = setTimeout(() => {
          requestAnimationFrame(_)
        }, this.period)
      }
    }
    requestAnimationFrame(_)
  }
  async requestData() {
    if (!this.app.isViewMode) return
    var { client } = this.state
    var query = this.query

    if (client && query) {
      this.client = this.root.findById(client).client

      var response = await this.client.query({
        query: gql`
          ${query}
        `
      })

      console.log('response', response)
      this.data = response
    }
  }
}

export class Query extends GraphQLQuery {
  static get image() {
    if (!Query._image) {
      Query._image = new Image()
      Query._image.src = COMPONENT_IMAGE_QUERY
    }

    return Query._image
  }

  render(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(Query.image, left, top, width, height)
  }
}

export class Mutation extends GraphQLQuery {
  static get image() {
    if (!Mutation._image) {
      Mutation._image = new Image()
      Mutation._image.src = COMPONENT_IMAGE_MUTATION
    }

    return Mutation._image
  }

  render(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(Mutation.image, left, top, width, height)
  }
}

Component.register('graphql-query', Query)
Component.register('graphql-mutation', Mutation)
