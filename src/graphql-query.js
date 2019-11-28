/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import COMPONENT_IMAGE from '../assets/symbol-graphql-query.png'
import gql from 'graphql-tag'

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
      placeholder: 'seconds'
    },
    {
      type: 'textarea',
      label: 'query',
      name: 'query'
    }
  ]
}

export default class GraphqlQuery extends DataSource(RectPath(Shape)) {
  static get image() {
    if (!GraphqlQuery._image) {
      GraphqlQuery._image = new Image()
      GraphqlQuery._image.src = COMPONENT_IMAGE
    }

    return GraphqlQuery._image
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
    this._initGraphqlQuery()
  }

  get nature() {
    return NATURE
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

      self._repeatTimer = setTimeout(() => {
        requestAnimationFrame(_)
      }, self.period)
    }

    requestAnimationFrame(_)
  }
  async requestData() {
    var { client, query } = this.state
    this.client = this.root.findById(client).client
    const response = await this.client.query({
      query: gql`
        ${query}
      `
    })
    console.log('response', response)
    this.data = response
  }
}

Component.register('graphql-query', GraphqlQuery)
