import { Observable } from 'rxjs';
import StateMachine from 'javascript-state-machine';
import StateMachineHistory from 'javascript-state-machine/lib/history';

StateMachine.prototype.listen = function() {
  return Observable.create(function(observer) {
    window.addEventListener('authed', handleEvent);

    function handleEvent(ev) {
      const currentState = fsm.state;
      if (currentState === 'unauthed') {
        if (ev.type === 'authed') {
          fsm.auth();
          fsm.onAuth(ev.detail.user);
        }
      }
      observer.next({ currentState: fsm.state, authUser: fsm.authUser });
    }
  });
};

const fsm = new StateMachine({
  init: 'unauthed',
  data: {
    authUser: {},
  },
  transitions: [{ name: 'auth', from: 'unauthed', to: 'authed' }],
  plugins: [
    new StateMachineHistory({ max: 100 }), //  <-- plugin enabled here
  ],
  methods: {
    onAuth: function(user) {
      this.authUser = user;
    },
  },
});

export default fsm;
