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

/**
 * The <CODE>BaseURL</CODE> defines the basic capabilities
 * of a portlet URL pointing back to the portlet.
 *
 * @since 2.0
 */
public interface BaseURL {

    /**
     * Sets the given String parameter to this URL. 
     * <p>
     * This method replaces all parameters with the given key.
     * <p>
     * The <code>PortletURL</code> implementation 'x-www-form-urlencoded' encodes
     * all  parameter names and values. Developers should not encode them.
     * <p>
     * A portlet container may prefix the attribute names internally 
     * in order to preserve a unique namespace for the portlet.
     * <p>
     * A parameter value of <code>null</code> indicates that this
     * parameter should be removed.
     *
     * @param   name
     *          the parameter name
     * @param   value
     *          the parameter value
     *
     * @exception  java.lang.IllegalArgumentException 
     *                            if name is <code>null</code>.
     */

    public void setParameter (String name, String value);


    /**
     * Sets the given String array parameter to this URL. 
     * <p>
     * This method replaces all parameters with the given key.
     * <p>
     * The <code>PortletURL</code> implementation 'x-www-form-urlencoded' encodes
     * all  parameter names and values. Developers should not encode them.
     * <p>
     * A portlet container may prefix the attribute names internally 
     * in order to preserve a unique namespace for the portlet.
     *
     * @param   name
     *          the parameter name
     * @param   values
     *          the parameter values
     *
     * @exception  java.lang.IllegalArgumentException 
     *                            if name is <code>null</code>.
     */

    public void setParameter (String name, String[] values);


    /**
     * Sets a parameter map for this URL.
     * <p>
     * All previously set parameters are cleared.
     * <p>
     * The <code>PortletURL</code> implementation 'x-www-form-urlencoded' encodes
     * all  parameter names and values. Developers should not encode them.
     * <p>
     * A portlet container may prefix the attribute names internally, 
     * in order to preserve a unique namespace for the portlet.
     *
     * @param  parameters   Map containing parameter names for 
     *                      the render phase as 
     *                      keys and parameter values as map 
     *                      values. The keys in the parameter
     *                      map must be of type String. The values 
     *                      in the parameter map must be of type
     *                      String array (<code>String[]</code>).
     *
     * @exception   java.lang.IllegalArgumentException 
     *                      if parameters is <code>null</code>, if
     *                      any of the keys in the Map are <code>null</code>, 
     *                      if any of the keys is not a String, or if any of 
     *                      the values is not a String array.
     */

    public void setParameters(java.util.Map<String, String[]> parameters);


    /**
     * Indicated the security setting for this URL. 
     * <p>
     * Secure set to <code>true</code> indicates that the portlet requests
     * a secure connection between the client and the portlet window for
     * this URL. Secure set to <code>false</code> indicates that the portlet 
     * does not need a secure connection for this URL. If the security is not
     * set for a URL, it should stay the same as the current request. 
     *
     * @param  secure  true, if portlet requests to have a secure connection
     *                 between its portlet window and the client; false, if
     *                 the portlet does not require a secure connection.
     *
     * @throws PortletSecurityException  if the run-time environment does
     *                                   not support the indicated setting
     */

    public void setSecure (boolean secure) throws PortletSecurityException;

    /**
     * Returns the portlet URL string representation to be embedded in the
     * markup.<br>
     * Note that the returned String may not be a valid URL, as it may
     * be rewritten by the portal/portlet-container before returning the 
     * markup to the client.
     * <p>
     * The returned URL is not XML escaped.
     * <p>
     * For writing URLs to an output stream the {@link #write(java.io.Writer)} or 
     * {@link #write(java.io.Writer, boolean)} method should be used as these are
     * more efficient.
     * 
     * @return   the encoded URL as a string
     */

    public String toString ();
    
    /** 
     * Returns a <code>Map</code> of the parameters 
     * currently set on this portlet URL via the 
     * <code>setParameter</code> or <code>setParameters</code>
     * methods.
     * <p>
     * The values in the returned <code>Map</code> are from type
     * String array (<code>String[]</code>).
     * <p>
     * If no parameters exist this method returns an empty <code>Map</code>.
     *             
     * @return     <code>Map</code> containing parameter names as 
     *             keys and parameter values as map values, or an empty <code>Map</code>
     *             if no parameters exist. The keys in the parameter
     *             map are of type String. The values in the parameter map are of type
     *             String array (<code>String[]</code>).
     *
     * @since 2.0
     */

    public java.util.Map<String, String[]> getParameterMap();

    /**
     * Writes the portlet URL to the output stream using the provided writer.
     * <p>
     * Note that the URL written to the output stream may not be a valid URL, as it may
     * be rewritten by the portal/portlet-container before returning the 
     * markup to the client.
     * <p>
     * The URL written to the output stream is always XML escaped. For writing
     * non-escaped URLs use {@link #write(java.io.Writer, boolean)}.
     *  
     * @param out  the writer to write the portlet URL to
     * @throws java.io.IOException  if an I/O error occured while writing the URL
     *
     * @since 2.0
     */
    public void write(java.io.Writer out) throws java.io.IOException;
    
    /**
     * Writes the portlet URL to the output stream using the provided writer.
     * If the parameter escapeXML is set to true the URL will be escaped to be
     * valid XML characters, i.e. &lt, &gt, &amp, &#039, &#034 will get converted
     * into their corresponding character entity codes (&lt to &&lt, &gt to &&gt, 
     * &amp to &&amp, &#039 to &&#039, &#034 to &&#034).
     * If escapeXML is set to false no escaping will be done.
     * <p>
     * Note that the URL written to the output stream may not be a valid URL, as it may
     * be rewritten by the portal/portlet-container before returning the 
     * markup to the client.
     *  
     * @param out       the writer to write the portlet URL to
     * @param escapeXML denotes if the URL should be XML escaped before written to the output
     *                  stream or not
     * @throws java.io.IOException  if an I/O error occurred while writing the URL
     *
     * @since 2.0
     */
     public void write(java.io.Writer out, boolean escapeXML) throws java.io.IOException;

    
    /**
     * Adds a String property to an existing key on the URL.
     * <p>
     * This method allows URL properties to have multiple values.
     * <p>
     * Properties can be used by portlets to provide vendor specific information
     * to the URL.
     *
     * @param key
     *            the key of the property
     * @param value
     *            the value of the property
     *
     * @exception java.lang.IllegalArgumentException
     *                if key is <code>null</code>.
     *
     * @since 2.0
     */
    public void addProperty(String key, String value);


    /**
     * Sets a String property on the URL.
     * <p>
     * Properties can be used by portlets to provide vendor specific information
     * to the URL.
     * <p>
     * This method resets all properties previously added with the same key.
     *
     * @param key
     *            the key of the property
     * @param value
     *            the value of the property
     *
     * @exception java.lang.IllegalArgumentException
     *                if key is <code>null</code>.
     *
     * @since 2.0
     */
    public void setProperty(String key, String value);
}
