/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import COMPONENT_IMAGE from '../assets/symbol-graphql-subscription.png'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { Component, DataSource, RectPath, Shape } from '@hatiolab/things-scene'

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
      type: 'textarea',
      label: 'query',
      name: 'query'
    }
  ]
}

export default class GraphqlSubscription extends DataSource(RectPath(Shape)) {
  static get image() {
    if (!GraphqlSubscription._image) {
      GraphqlSubscription._image = new Image()
      GraphqlSubscription._image.src = COMPONENT_IMAGE
    }

    return GraphqlSubscription._image
  }

  dispose() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    if (this.client) {
      this.client.reconnect = false
      this.client.unsubscribeAll()
      this.client.close(true)
    }

    super.dispose()
  }

  render(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(GraphqlSubscription.image, left, top, width, height)
  }

  ready() {
    this._initGraphqlSubscription()
  }

  get nature() {
    return NATURE
  }

  _initGraphqlSubscription() {
    if (!this.app.isViewMode) return

    this.requestData()
  }

  async requestData() {
    var { endpoint, query } = this.state
    var self = this

    this.client = new SubscriptionClient(endpoint, {
      reconnect: true
    })

    this.client.onConnected(() => {
      this.subscription = this.client.request({ query }).subscribe({
        next({ data }) {
          if (data) {
            self.data = data
          }
        }
      })
    })
  }
}

Component.register('graphql-subscription', GraphqlSubscription)
