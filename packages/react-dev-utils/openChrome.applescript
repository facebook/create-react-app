(*
Copyright (c) 2015-present, Facebook, Inc.
All rights reserved.

This source code is licensed under the BSD-style license found in the
-- LICENSE file in the root directory of this source tree. An additional grant
of patent rights can be found in the PATENTS file in the same directory.
*)

on run argv
  set theURL to item 1 of argv

  tell application "Chrome"

    if (count every window) = 0 then
      make new window
    end if

    -- 1: Looking for tab running debugger
    -- then, Reload debugging tab if found
    -- then return
    set foundWindow to my findTabByURL(theURL)
    if foundWindow is not equal null then
      set theTab to foundWindow's targetTab
      set theTabIndex to foundWindow's targetTabIndex
      set theWindow to foundWindow's targetWindow

      tell theTab to reload
      set index of theWindow to 1
      set theWindow's active tab index to theTabIndex
      tell theWindow to activate
      return
    end if

    -- 2: Looking for Empty tab
    -- In case debugging tab was not found
    -- We try to find an empty tab instead
    set foundWindow to my findTabByURL("chrome://newtab/")
    if foundWindow is not equal null then
      set theTab to foundWindow's targetTab
      set theTabIndex to foundWindow's targetTabIndex
      set theWindow to foundWindow's targetWindow

      set URL of theTab to theURL
      set index of theWindow to 1
      set theWindow's active tab index to theTabIndex
      tell theWindow to activate
      return
    end if

    -- 3: Create new tab
    -- both debugging and empty tab were not found
    -- make a new tab with url
    tell window 1
        activate
        make new tab with properties {URL:theURL}
    end tell
  end tell
end run

-- Function:
-- Lookup tab with given url
-- return object
-- - targetWindow
-- - targetTab
-- - targetTabIndex
on findTabByURL(lookupUrl)
  tell application "Google Chrome"
    -- Find a tab currently running the debugger
    set found to false
    set theTabIndex to -1
    repeat with theWindow in every window
      set theTabIndex to 0
      repeat with theTab in every tab of theWindow
        set theTabIndex to theTabIndex + 1
        if (theTab's URL as string) contains lookupUrl then
          set found to true
          exit repeat
        end if
      end repeat

      if found then
        -- create object
        script myWindow
          property targetTab: theTab
          property targetTabIndex: theTabIndex
          property targetWindow: theWindow
        end script
        return myWindow
      end if
    end repeat
  end tell
  return null
end findTabByURL
