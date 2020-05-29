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
 * The <CODE>PortletMode</CODE> class represents
 * the possible modes that a portlet can assume.
 * <P>
 * A portlet mode indicates the function a portlet is performing.
 * Normally, portlets perform different tasks and create different
 * content depending on the function they are currently performing.
 * When invoking a portlet, the portlet container provides the
 * current portlet mode to the portlet.
 * <p>
 * Portlets can programmatically change their portlet
 * mode when processing an action request.
 * <P>
 * This class defines the default portlet modes <code>EDIT, HELP, VIEW</code>.
 * Additional portlet modes may be defined by calling the constructor
 * of this class. If a portal/portlet-container does not support a 
 * custom portlet mode defined in the portlet application deployment descriptor, 
 * the custom portlet mode will be ignored by the portal/portlet container.
 */
public class PortletMode
{

  /**
   * The expected functionality for a portlet in <code>VIEW</code> portlet mode 
   * is to generate markup reflecting the current state of the portlet. 
   * For example, the <code>VIEW</code> portlet mode of a portlet may 
   * include one or more screens that the user can navigate and interact 
   * with, or it may consist of static content that does not require any 
   * user interaction.
   * <P>
   * This mode must be supported by the portlet.
   * <p>
   * The string value for this mode is <code>"view"</code>.
   */
  public final static PortletMode VIEW = new PortletMode ("view");

  /**
   * Within the <code>EDIT</code> portlet mode, a portlet should provide 
   * content and logic that lets a user customize the behavior of the portlet. 
   * The EDIT portlet mode may include one or more screens among which 
   * users can navigate to enter their customization data.
   * <p>
   * Typically, portlets in <code>EDIT</code> portlet mode will 
   * set or update portlet preferences.
   * <P>
   * This mode is optional.
   * <p>
   * The string value for this mode is <code>"edit"</code>.
   */
  public final static PortletMode EDIT = new PortletMode ("edit");

  /**
   * When in <code>HELP</code> portlet mode, a portlet should provide help 
   * information about the portlet. This help information could be 
   * a simple help screen explaining the entire portlet in
   * coherent text or it could be context-sensitive help.
   * <P>
   * This mode is optional.
   * <p>
   * The string value for this mode is <code>"help"</code>.
   */
  public final static PortletMode HELP = new PortletMode ("help");




  private String _name;


  /**
   * Creates a new portlet mode with the given name.
   * <p>
   * Upper case letters in the name are converted to
   * lower case letters.
   *
   * @param name The name of the portlet mode
   */
  public PortletMode(String name) {
    if (name==null) {
      throw new IllegalArgumentException("PortletMode name can not be NULL");
    }
    _name = name.toLowerCase(Locale.ENGLISH);
  }


  /**
   * Returns a String representation of this portlet mode.
   * Portlet mode names are always lower case names.
   *
   * @return  String representation of this portlet mode
   */

  public String toString() {
    return _name;
  }

  /**
   * Returns the hash code value for this portlet mode.
   * The hash code is constructed by producing the
   * hash value of the String value of this mode.
   *
   * @return  hash code value for this portlet mode
   */

  public int hashCode() {
    return _name.hashCode();
  }

  /**
   * Compares the specified object with this portlet mode
   * for equality. Returns <code>true</code> if the
   * Strings <code>equals</code> method for the String
   * representing the two portlet modes returns <code>true</code>.
   * 
   * @param   object   the portlet mode to compare this portlet mode with
   * 
   * @return  true, if the specified object is equal with this portlet mode
   */
     
  public boolean equals(Object object) {
    if ( object instanceof PortletMode )
      return _name.equals(((PortletMode) object)._name);
    else
      return false;
  }
}

