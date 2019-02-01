import { Observable } from 'rxjs';
import StateMachine from 'javascript-state-machine';
import StateMachineHistory from 'javascript-state-machine/lib/history';

StateMachine.prototype.listen = function() {
  return Observable.create(function(observer) {
    window.addEventListener('authed', handleEvent);
    window.addEventListener('signout', handleEvent);

    function handleEvent(ev) {
      const currentState = fsm.state;
      switch (currentState) {
        case 'unauthed':
          if (ev.type === 'authed') {
            fsm.auth();
            fsm.onAuth(ev.detail.user);
          }
          break;
        case 'authed':
          if (ev.type === 'signout') {
            console.log('here');
            fsm.signout();
            fsm.onSignout();
          }
          break;
        default:
          break;
      }
      observer.next({ currentState: fsm.state, user: fsm.user });
    }
  });
};

const fsm = new StateMachine({
  init: 'unauthed',
  data: {
    user: {},
  },
  transitions: [
    { name: 'auth', from: 'unauthed', to: 'authed' },
    { name: 'signout', from: 'authed', to: 'unauthed' },
  ],
  plugins: [
    new StateMachineHistory({ max: 100 }), //  <-- plugin enabled here
  ],
  methods: {
    onAuth: function(user) {
      this.user = user;
    },
    onSignout: function() {
      this.user = {};
    },
  },
});

export default fsm;
