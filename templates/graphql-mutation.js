import icon from '../assets/icon-graphql-mutation.png'

export default {
  type: 'graphql-mutation',
  description: 'graphql-mutation',
  group: 'dataSource',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon,
  model: {
    type: 'graphql-mutation',
    left: 10,
    top: 10,
    width: 100,
    height: 100,
    autoStart: false,
    period: 0,
    query: `mutation {
  resolverName ( patches:[] ) {
    id
  }
}`
  }
}
