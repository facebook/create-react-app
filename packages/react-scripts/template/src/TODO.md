- frags
- error handling
  - offer a way to reset?
- hooks
  - remount on error?
  - compare introspection?
- hocs?
  - with self as input
  - returning a class
  - HOC itself by mistake
    - protect against nested?
- type equality
  - memo and friends
  - nested / applied twice
  - mutually recursive
  - re-exports
    - same HOC applied early, two callsites
- classes
  - how to detect and reload?
- render props
- directives?
- when to accept?
- test integrations

lazy()?

- lazy of memo of proxy

- maybe Proxy?
- do I want to preserve type? elementType? or what?
  or lazy element?

- what about static fields

  - we either break Foo.thing or <Foo />.type?
  - maybe we never wrap, but point to latest from current one?
  - could also bail out

- how to force update all (incl. inside memo)

let A = createA();
B() {
<A />
}

- two kinds of edits
  - reeval child with new data
  - remember new self

* think in terms of "assign"?
