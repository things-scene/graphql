import icon from '../assets/icon-graphql-query.png'

export default {
  type: 'graphql-query',
  description: 'graphql-query',
  group: 'dataSource',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon,
  model: {
    type: 'graphql-query',
    left: 10,
    top: 10,
    width: 100,
    height: 100,
    autoStart: true,
    period: 0,
    query: `query {
  boards {
    items {
      id
      name
      description
      thumbnail
      createdAt
      updatedAt
    }
    total
  }
}`
  }
}
