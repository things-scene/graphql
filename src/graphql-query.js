/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import COMPONENT_IMAGE from '../assets/symbol-graphql-query.png'
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

// export default class GraphqlQuery extends DataSource(RectPath(Shape)) {
export default class GraphqlQuery extends DataSource(RectPath(Shape)) {
  static get image() {
    if (!GraphqlQuery._image) {
      GraphqlQuery._image = new Image()
      GraphqlQuery._image.src = COMPONENT_IMAGE
    }

    return GraphqlQuery._image
  }

  get nature() {
    return NATURE
  }

  onchange(after) {
    if ('value' in after) {
      this.requestData()
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
    var changedQuery = (Component.buildSubstitutor(_query, this, JSON.stringify) || (() => _query))()
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

    try {
      this._client && this._client.end(true, () => {})
    } catch (e) {
      console.error(e)
    }
    delete this._client
  }

  render(context) {
    /*
     * TODO role이 publisher 인지 subscriber 인지에 따라서 구분할 수 있는 표시를 추가할 것.
     */

    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(GraphqlQuery.image, left, top, width, height)
  }

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

    var self = this

    // requestAnimationFrame 이 호출되지 않을 때는 requestData 호출도 하지 않도록 함.
    function _() {
      if (!self._isStarted) {
        return
      }
      self.requestData()
      if (!Number.isNaN(self.period) && self.period > 0) {
        self._repeatTimer = setTimeout(() => {
          requestAnimationFrame(_)
        }, self.period)
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

Component.register('graphql-query', GraphqlQuery)
