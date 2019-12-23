import icon from '../assets/icon-graphql-client.png'

export default {
  type: 'graphql-client',
  description: 'graphql-client',
  group: 'dataSource',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon,
  model: {
    type: 'graphql-client',
    left: 10,
    top: 10,
    width: 100,
    height: 100,
    fillStyle: 'cyan',
    strokeStyle: 'darkgray',
    endpoint: '/'
  }
}
