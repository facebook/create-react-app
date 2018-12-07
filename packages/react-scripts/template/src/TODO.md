- other strategies:
  - seb suggested walking down the tree and reconciling
- write down constraints.

  - actually, tests!

* don't accept module if either assignment failed
* frags
* error handling
  - reenable overlay
  - offer a way to reset?
  - suppress error dialog?
  - suppress messages?
  - check types? debug tools?

- highlight updates

* directives?
  - !
* hooks
  - remount on error?
  - compare introspection?
* hocs?
  - with self as input
  - returning a class
  - HOC itself by mistake
    - protect against nested?
* type equality
  - memo and friends
  - nested / applied twice
  - mutually recursive
  - re-exports
    - same HOC applied early, two callsites
* classes
  - how to detect and reload?
* render props
* when to accept?
* test integrations
* exotic (lazy, memo, fwd)
* how to force update all (incl. inside memo)
* displayName etc
* false positives for things getting wrapped
* forwardRef
  - make sure refs _on_ proxies actually work
