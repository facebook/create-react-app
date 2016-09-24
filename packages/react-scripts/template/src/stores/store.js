import {action, observable} from 'mobx';

class AppStore {
  @observable title = 'Hello ES7 world 😜';

  @action changeRandomTitle() {
    this.title = `Title #${Math.floor((Math.random() * 100) + 1)} 😲`;
  }
}

const store = {
  app: new AppStore()
}

export default store;