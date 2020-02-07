/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore'
  },
  query: {
    fetchPolicy: 'no-cache', //'network-only'
    errorPolicy: 'all'
  },
  mutate: {
    errorPolicy: 'all'
  }
}

const ERROR_HANDLER = ({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) => {
      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            level: 'error',
            message: `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ex: graphQLErrors
          }
        })
      )
    })

  if (networkError) {
    switch (networkError.statusCode) {
      case 401:
        /* 401 에러가 리턴되면, 인증이 필요하다는 메시지를 dispatch 한다. 이 auth 모듈 등에서 이 메시지를 받아서 signin 프로세스를 진행할 수 있다. */
        document.dispatchEvent(
          new CustomEvent('auth-required', {
            bubbles: true,
            composed: true
          })
        )
        break
      default:
        document.dispatchEvent(
          new CustomEvent('notify', {
            detail: {
              level: 'error',
              message: `[Network error - ${networkError.statusCode}]: ${networkError}`,
              ex: networkError
            }
          })
        )
    }
  }
}

import COMPONENT_IMAGE from '../assets/symbol-graphql-client.png'

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
    }
  ]
}

export default class GraphqlClient extends DataSource(RectPath(Shape)) {
  static get image() {
    if (!GraphqlClient._image) {
      GraphqlClient._image = new Image()
      GraphqlClient._image.src = COMPONENT_IMAGE
    }

    return GraphqlClient._image
  }

  ready() {
    super.ready()

    this.init()
  }

  init() {
    var { endpoint } = this.state

    if (!endpoint) {
      console.warn('endpoint not defined')
      return
    }

    var cache = new InMemoryCache()

    const client = new ApolloClient({
      defaultOptions,
      cache,
      link: ApolloLink.from([
        onError(ERROR_HANDLER),
        new HttpLink({
          endpoint,
          credentials: 'include'
        })
      ])
    })

    this._client = client
  }

  get client() {
    return this._client
  }

  dispose() {
    super.dispose()

    try {
      if (this._client) {
        this._client.stop()
      }
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
    context.drawImage(GraphqlClient.image, left, top, width, height)
  }

  onchangeData(data, before) {
    super.onchangeData(data, before)
  }

  get nature() {
    return NATURE
  }
}

Component.register('graphql-client', GraphqlClient)
