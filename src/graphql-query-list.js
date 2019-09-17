/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import COMPONENT_IMAGE from '../assets/no-image.png'

import { Component, DataSource, RectPath, Shape } from '@hatiolab/things-scene'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'string',
      label: 'broker',
      name: 'broker',
      placeholder: 'WebSocket hostname'
    },
    {
      type: 'number',
      label: 'port',
      name: 'port',
      placeholder: '15675'
    },
    {
      type: 'string',
      label: 'path',
      name: 'path',
      placeholder: '/mqtt or /ws'
    },
    {
      type: 'string',
      label: 'user',
      name: 'user'
    },
    {
      type: 'string',
      label: 'password',
      name: 'password',
      property: 'password'
    },
    {
      type: 'string',
      label: 'topic',
      name: 'topic'
    },
    {
      type: 'number',
      label: 'qos',
      name: 'qos',
      placeholder: '0..2'
    },
    {
      type: 'string',
      label: 'client-id',
      name: 'clientId'
    },
    {
      type: 'select',
      label: 'role',
      name: 'role',
      property: {
        options: [
          {
            display: 'Subscriber',
            value: 'subscriber'
          },
          {
            display: 'Publisher',
            value: 'publisher'
          }
        ]
      }
    },
    {
      type: 'select',
      label: 'data-format',
      name: 'dataFormat',
      property: {
        options: [
          {
            display: 'Plain Text',
            value: 'text'
          },
          {
            display: 'JSON',
            value: 'json'
          }
        ]
      }
    },
    {
      type: 'checkbox',
      label: 'retain',
      name: 'retain'
    },
    {
      type: 'checkbox',
      label: 'ssl',
      name: 'ssl'
    }
  ]
}

export default class GraphqlQueryList extends DataSource(RectPath(Shape)) {
  static get image() {
    if (!GraphqlQueryList._image) {
      GraphqlQueryList._image = new Image()
      GraphqlQueryList._image.src = COMPONENT_IMAGE
    }

    return GraphqlQueryList._image
  }

  ready() {
    super.ready()

    if (!this.app.isViewMode) return

    this._initGraphqlQueryListConnection()
  }

  _initGraphqlQueryListConnection() {
    try {
      this._client && this._client.end(true, () => {})
    } catch (e) {
      console.error(e)
    }
    delete this._client

    var {
      broker,
      port = 8441,
      clientId = 'THINGS-BOARD',
      topic,
      qos = 1,
      retain = false,
      path = '/mqtt',
      dataFormat = 'text',
      user,
      password,
      ssl = false,
      role = 'subscriber'
    } = this.model

    if (!broker) {
      console.warn('broker not defined')
      return
    }

    clientId = [clientId, role, Date.now()].join('-')

    var client = mqtt.connect(`ws://${broker}:${port}${path}`, {
      keepalive: 10,
      clientId,
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      will: {
        topic: 'WillMsg',
        payload: 'Connection Closed abnormally..!',
        qos: 0,
        retain: false
      },
      username: user,
      password: password,
      rejectUnauthorized: false
    })

    client.on('error', err => {
      console.error(err)
      client.end()
    })

    client.on('connect', packet => {
      console.log('client connected:', clientId, packet)

      role != 'publisher' &&
        client.subscribe(topic, {
          qos,
          onSuccess: () => {
            console.log('subscription success')
          },
          onFailure: failure => {
            console.log('subscription failed', failure.errorCode, failure.errorMessage)
          }
        })
    })

    client.on('message', (topic, message, packet) => {
      this.data = this._convertDataFormat(message.toString(), dataFormat)
    })

    client.on('close', () => {
      console.log(clientId + ' disconnected')
    })

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
    context.drawImage(GraphqlQueryList.image, left, top, width, height)
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

Component.register('graphql-query-list', GraphqlQueryList)
