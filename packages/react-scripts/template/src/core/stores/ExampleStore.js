import { observable } from 'mobx'

export default class ExampleStore {
  @observable
  exampleData = { text: 'hello mobx store' }
}
