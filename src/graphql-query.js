/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import COMPONENT_IMAGE from "./graphql-query.png";
import gql from "graphql-tag";

import { Component, DataSource, RectPath, Shape } from "@hatiolab/things-scene";

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: "string",
      label: "client",
      name: "client"
    },
    {
      type: "textarea",
      label: "query",
      name: "query"
    }
  ]
};

export default class GraphqlQuery extends DataSource(RectPath(Shape)) {
  static get image() {
    if (!GraphqlQuery._image) {
      GraphqlQuery._image = new Image();
      GraphqlQuery._image.src = COMPONENT_IMAGE;
    }

    return GraphqlQuery._image;
  }

  dispose() {
    try {
      this._client && this._client.end(true, () => {});
    } catch (e) {
      console.error(e);
    }
    delete this._client;

    super.dispose();
  }

  render(context) {
    /*
     * TODO role이 publisher 인지 subscriber 인지에 따라서 구분할 수 있는 표시를 추가할 것.
     */

    var { left, top, width, height } = this.bounds;

    context.beginPath();
    context.drawImage(GraphqlQuery.image, left, top, width, height);
  }

  async onclick() {
    var { client, query } = this.state;

    this.client = this.root.findById(client).client;

    const response = await this.client.query({
      query: gql`
        ${query}
      `
    });

    console.log("response", response);
    this.data = response;
  }

  get nature() {
    return NATURE;
  }
}

Component.register("graphql-query", GraphqlQuery);
