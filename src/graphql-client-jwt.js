/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import COMPONENT_IMAGE from '../assets/no-image.png'

import { Component, DataSource, RectPath, Shape } from '@hatiolab/things-scene'
import mqtt from 'mqtt'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'string',
      label: 'endpoint',
      name: 'endpoint'
    },
    {
      type: 'string',
      label: 'token',
      name: 'token'
    }
  ]
}

export default class GraphqlClientJwt extends DataSource(RectPath(Shape)) {
  static get image() {
    if (!GraphqlClientJwt._image) {
      GraphqlClientJwt._image = new Image()
      GraphqlClientJwt._image.src = COMPONENT_IMAGE
    }

    return GraphqlClientJwt._image
  }

  ready() {
    super.ready()

    this._initGraphqlClientJwtConnection()
  }

  _initGraphqlClientJwtConnection() {
    try {
      // this._client && this._client.end(true, () => {});
    } catch (e) {
      console.error(e)
    }
    delete this._client

    var { endpoint, token } = this.model

    // create client
    // signin here
    this._client = client
  }

  dispose() {
    try {
      this._client && this._client.end(true, () => {})
    } catch (e) {
      console.error(e)
    }
    delete this._client

    super.dispose()
  }

  render(context) {
    /*
     * TODO role이 publisher 인지 subscriber 인지에 따라서 구분할 수 있는 표시를 추가할 것.
     */

    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(GraphqlClientJwt.image, left, top, width, height)
  }

  onchangeData(data, before) {
    super.onchangeData(data, before)

    const { topic, role = 'subscriber' } = this.model

    if (!this._client || !this._client.connected) {
      return
    }

    if (role == 'subscriber') {
      return
    }

    this._client.publish(topic, JSON.stringify(data.data), {
      qos: 0,
      retain: false
    })
  }

  get nature() {
    return NATURE
  }
}

Component.register('graphql-client-jwt', GraphqlClientJwt)
