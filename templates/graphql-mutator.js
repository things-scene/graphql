import icon from '../assets/icon-graphql-mutator.png'

export default {
  type: 'graphql-mutator',
  description: 'graphql-mutator',
  group: 'dataSource',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon,
  model: {
    type: 'graphql-mutator',
    left: 10,
    top: 10,
    width: 100,
    height: 100,
    lineWidth: 1,
    updateGql: ` mutation{
        updateMultipleBoard(patches:#{update}){
          id
        }
    }     
    `
  }
}
