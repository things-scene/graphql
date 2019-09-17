import icon from '../assets/graphql-quick-bind-query.png'

export default {
  type: 'graphql-quick-bind-query',
  description: 'graphql-quick-bind-query',
  group: 'dataSource',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon,
  model: {
    type: 'graphql-quick-bind-query',
    left: 10,
    top: 10,
    width: 100,
    height: 100,
    lineWidth: 1,
    query: `{
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
