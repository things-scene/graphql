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
      type: 'number',
      label: 'period',
      name: 'period',
      placeholder: 'SECONDS'
    },
    {
      type: 'textarea',
      label: 'query',
      name: 'query'
    }
  ]
}

// export default class GraphqlQuery extends DataSource(RectPath(Shape)) {
export default class GraphqlQuickBindQuery extends DataSource(RectPath(Shape)) {
  static get image() {
    if (!GraphqlQuickBindQuery._image) {
      GraphqlQuickBindQuery._image = new Image()
      GraphqlQuickBindQuery._image.src = COMPONENT_IMAGE
    }

    return GraphqlQuickBindQuery._image
  }

  get nature() {
    return NATURE
  }

  // setElementProperties(element) {
  //   element.onchange = () => {}
  // }

  // onchange(after, before) {
  //   super.onchange(after, before)

  //   if ('query' in after) {
  //     delete this._querySubstitutor
  //   }
  // }

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

  get query() {
    var _query = this.state.query

    var checkShortCut = String(_query)
    var props = (checkShortCut.match(/#{(\S*)}/gi) || []).map(match => this.parse(match))
    var ids = (checkShortCut.match(/\${[^}]*}/gi) || []).map(match => this.parse(match))

    if (props.length == 0 && ids.length == 0) return _query

    if (!this._querySubstitutor) {
      this._querySubstitutor = Component.buildSubstitutor(_query, this, this.entirelyConvertObj)
    }

    return this._querySubstitutor(_query)
  }

  dispose() {
    super.dispose()
    delete this._querySubstitutor
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
    context.drawImage(GraphqlQuickBindQuery.image, left, top, width, height)
  }

  ready() {
    super.ready()
    this._initGraphqlQuery()
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

  entirelyConvertObj(value) {
    while (value && typeof value === 'object') {
      return (
        Object.entries(value)
          .reduce((a, e) => {
            if (typeof e[1] != 'function') {
              a += `${e[0]} : "${e[1]}", `
            }
            return a
          }, '`{')
          .slice(1, -2) + '}'
      )
    }
    return value
  }

  parse(text) {
    var parsed = text
      .substr(2, text.length - 3)
      .trim()
      .replace(/\[(\w+)\]/g, '.$1')
      .replace(/^\./, '')
      .split('.')
      .filter(accessor => !!accessor.trim())
    var accessors = parsed.slice(1)
    return {
      match: text,
      target: parsed[0],
      accessor:
        accessors.length > 0
          ? function(o) {
              return accessors.reduce((o, accessor) => (o ? o[accessor] : undefined), o)
            }
          : SELF
    }
  }
}

Component.register('graphql-quick-bind-query', GraphqlQuickBindQuery)
