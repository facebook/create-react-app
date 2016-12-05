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

    -- Find a tab currently running the debugger
    set found to false
    set theTabIndex to -1
    repeat with theWindow in every window
      set theTabIndex to 0
      repeat with theTab in every tab of theWindow
        set theTabIndex to theTabIndex + 1
        if theTab's URL as string contains theURL then
          set found to true
          exit repeat
        end if
      end repeat

      if found then
        exit repeat
      end if
    end repeat

    -- Reload debugging tab if found
    -- then return
    if found then
      tell theTab to reload
      set index of theWindow to 1
      set theWindow's active tab index to theTabIndex
      tell theWindow to activate
      return
    end if

    -- In case debugging tab was not found
    -- We try to find an empty tab instead
    set foundEmpty to false
    set theEmptyTabIndex to -1
    repeat with theWindow in every window
      set theEmptyTabIndex to 0
      repeat with theTab in every tab of theWindow
        set theEmptyTabIndex to theEmptyTabIndex + 1
        if theTab's URL as string contains "chrome://newtab/" then
          set foundEmpty to true
          exit repeat
        end if
      end repeat

      if foundEmpty then
        exit repeat
      end if
    end repeat

    -- if empty tab was found
    if foundEmpty then
      set URL of theTab to theURL
      set index of theWindow to 1
      set theWindow's active tab index to theEmptyTabIndex
      tell theWindow to activate
    else
      -- both debugging and empty tab were not found
      -- make a new tab with url
      tell window 1
        activate
        make new tab with properties {URL:theURL}
      end tell
    end if

  end tell
end run
