/*  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

/*
 * This source code implements specifications defined by the Java
 * Community Process. In order to remain compliant with the specification
 * DO NOT add / change / or delete method signatures!
 */

package javax.portlet;

import java.util.Locale;


/**
 * The <CODE>WindowState</CODE> class represents
 * the possible window states that a portlet window can assume.
 * <P>
 * This class defines a standard set of the most basic portlet window states.
 * Additional window states may be defined by calling the constructor of
 * this class. If a portal/portlet-container does not support a 
 * custom window state defined in the portlet application deployment descriptor, 
 * the custom window state will be ignored by the portal/portlet container.
 */

public class WindowState
{

  /**
   * The <code>NORMAL</code> window state indicates that a portlet 
   * may be sharing the page with other portlets. It may also 
   * indicate that the target device has limited display capabilities.
   * Therefore, a portlet should restrict the size of its rendered 
   * output in this window state.
   * <p>
   * The string value for this state is <code>"normal"</code>.
   */
  public final static WindowState NORMAL = new WindowState ("normal");

  /**
   * The <code>MAXIMIZED</code> window state is an indication 
   * that a portlet may be the only portlet being rendered in the 
   * portal page, or that the portlet has more space compared to other portlets
   * in the portal page. A portlet may generate richer content 
   * when its window state is <code>MAXIMIZED</code>.
   * <p>
   * The string value for this state is <code>"maximized"</code>.
   */
  public final static WindowState MAXIMIZED = new WindowState ("maximized");
  
  /**
   * When a portlet is in <code>MINIMIZED</code> window state, 
   * the portlet should only render minimal output or no output at all.
   * <p>
   * The string value for this state is <code>"minimized"</code>.
   */
  public final static WindowState MINIMIZED = new WindowState ("minimized");



  private String _name;


  /**
   * Creates a new window state with the given name.
   * <p>
   * Upper case letters in the name are converted to
   * lower case letters.
   *
   * @param name The name of the window state
   */
  public WindowState(String name) {
    if (name==null) {
      throw new IllegalArgumentException("WindowState name can not be NULL");
    }
    _name = name.toLowerCase(Locale.ENGLISH);
  }

  /**
   * Returns a String representation of this window state.
   * Window state names are always lower case names.
   *
   * @return  String representation of this window state.
   */

  public String toString() {
    return _name;
  }


  /**
   * Returns the hash code value for this window state.
   * The hash code is constructed by producing the
   * hash value of the String value of this window state.
   *
   * @return  hash code value for this window state
   */

  public int hashCode() {
    return _name.hashCode();
  }


  /**
   * Compares the specified object with this window state
   * for equality. Returns <code>true</code> if the
   * Strings <code>equals</code> method for the String
   * representing the two window states returns <code>true</code>.
   * 
   * @param   object  the window state to compare this window state with.
   * 
   * @return  true, if the specified object is equal with this window state.
   */

  public boolean equals(Object object) {
    if ( object instanceof WindowState )
      return _name.equals(((WindowState) object)._name);
    else
      return false;
  }
}

