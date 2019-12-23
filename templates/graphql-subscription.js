import icon from '../assets/icon-graphql-subscription.png'

export default {
  type: 'graphql-subscription',
  description: 'graphql-subscription',
  group: 'dataSource',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon,
  model: {
    type: 'graphql-subscription',
    left: 10,
    top: 10,
    width: 100,
    height: 100,
    lineWidth: 1,
    endpoint: 'ws://localhost:3000/subscriptions',
    requestType: 'mutation',
    query: `subscription {
  systemRebooted {
    name
    version
    description
  }
}`
  }
}
