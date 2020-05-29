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
 * The <CODE>StateAwareResponse</CODE> represents a response that can modify
 * state information or send events.<BR>
 * It extends the PortletResponse interface.
 * 
 * @since 2.0
 * @see PortletResponse
 */
public interface StateAwareResponse extends PortletResponse {

	/**
     * Sets the window state of a portlet to the given window state.
     * <p>
     * Possible values are the standard window states and any custom window
     * states supported by the portal and the portlet. Standard window states
     * are:
     * <ul>
     * <li>MINIMIZED
     * <li>NORMAL
     * <li>MAXIMIZED
     * </ul>
     * 
     * @param windowState
     *            the new portlet window state
     * 
     * @exception WindowStateException
     *                if the portlet cannot switch to the specified window
     *                state. To avoid this exception the portlet can check the
     *                allowed window states with
     *                <code>Request.isWindowStateAllowed()</code>.
     * @exception java.lang.IllegalStateException
     *                if the method is invoked after <code>sendRedirect</code>
     *                has been called.
     * 
     * @see WindowState
     */

	public void setWindowState(WindowState windowState)
			throws WindowStateException;

	/**
     * Sets the portlet mode of a portlet to the given portlet mode.
     * <p>
     * Possible values are the standard portlet modes and any custom portlet
     * modes supported by the portal and the portlet. Portlets must declare in
     * the deployment descriptor the portlet modes they support for each markup
     * type. Standard portlet modes are:
     * <ul>
     * <li>EDIT
     * <li>HELP
     * <li>VIEW
     * </ul>
     * <p>
     * Note: The portlet may still be called in a different window state in the
     * next render call, depending on the portlet container / portal.
     * 
     * @param portletMode
     *            the new portlet mode
     * 
     * @exception PortletModeException
     *                if the portlet cannot switch to this portlet mode, because
     *                the portlet or portal does not support it for this markup,
     *                or the current user is not allowed to switch to this
     *                portlet mode. To avoid this exception the portlet can
     *                check the allowed portlet modes with
     *                <code>Request.isPortletModeAllowed()</code>.
     * @exception java.lang.IllegalStateException
     *                if the method is invoked after <code>sendRedirect</code>
     *                has been called.
     */

	public void setPortletMode(PortletMode portletMode)
			throws PortletModeException;

	/**
     * Sets a parameter map for the render request.
     * <p>
     * All previously set render parameters are cleared.
     * <p>
     * These parameters will be accessible in all sub-sequent render calls via
     * the <code>PortletRequest.getParameter</code> call until a new request
     * is targeted to the portlet.
     * <p>
     * The given parameters do not need to be encoded prior to calling this
     * method.
     * <p>
     * The portlet should not modify the map any further after calling
     * this method.
     * 
     * @param parameters
     *            Map containing parameter names for the render phase as keys
     *            and parameter values as map values. The keys in the parameter
     *            map must be of type String. The values in the parameter map
     *            must be of type String array (<code>String[]</code>).
     * 
     * @exception java.lang.IllegalArgumentException
     *                if parameters is <code>null</code>, if any of the
     *                keys in the Map are <code>null</code>, if any of
     *                the keys is not a String, or if any of the values is not a
     *                String array.
     * @exception java.lang.IllegalStateException
     *                if the method is invoked after <code>sendRedirect</code>
     *                has been called.
     */

	public void setRenderParameters(java.util.Map<String, String[]> parameters);

	/**
     * Sets a String parameter for the render request.
     * <p>
     * These parameters will be accessible in all sub-sequent render calls via
     * the <code>PortletRequest.getParameter</code> call until a request is
     * targeted to the portlet.
     * <p>
     * This method replaces all parameters with the given key.
     * <p>
     * The given parameter do not need to be encoded prior to calling this
     * method.
     * 
     * @param key
     *            key of the render parameter
     * @param value
     *            value of the render parameter
     * 
     * @exception java.lang.IllegalArgumentException
     *                if key is <code>null</code>.
     * @exception java.lang.IllegalStateException
     *                if the method is invoked after <code>sendRedirect</code>
     *                has been called.
     */

	public void setRenderParameter(String key, String value);

	/**
     * Sets a String array parameter for the render request.
     * <p>
     * These parameters will be accessible in all sub-sequent render calls via
     * the <code>PortletRequest.getParameter</code> call until a request is
     * targeted to the portlet.
     * <p>
     * This method replaces all parameters with the given key.
     * <p>
     * The given parameter do not need to be encoded prior to calling this
     * method.
     * 
     * @param key
     *            key of the render parameter
     * @param values
     *            values of the render parameter
     * 
     * @exception java.lang.IllegalArgumentException
     *                if key or value are <code>null</code>.
     * @exception java.lang.IllegalStateException
     *                if the method is invoked after <code>sendRedirect</code>
     *                has been called.
     */

	public void setRenderParameter(String key, String[] values);

	/**
     * Publishes an Event with the given payload.
     * <p>
     * The object type of the value must be compliant with the specified event
     * type in the portlet deployment descriptor.
     * <p>
     * The value must have a valid JAXB binding and be serializable.
     * 
     * @param name
     *            the event name to publish, must not be <code>null</code>
     * @param value
     *            the value of this event, must have a valid JAXB binding and 
     *            be serializable, or <code>null</code>.
     * 
     * @exception java.lang.IllegalArgumentException
     *                if name is <code>null</code>, the value is not
     *                serializable, the value does not have a valid JAXB binding, the
     *                object type of the value is not the same as specified in
     *                the portlet deployment descriptor for this event name.
     * @since 2.0
     */
	public void setEvent(javax.xml.namespace.QName name, java.io.Serializable value);

	/**
     * Publishes an Event with the given payload in the default namespace.
     * <p>
     * The name is treated as local part of the event QName and the namespace
     * is either taken from the <code>default-event-namespace</code> element
     * in the portlet deployment descriptor, or if this element is not provided
     * the XML default namespace XMLConstants.NULL_NS_URI is used.
     * <p>
     * The object type of the value must be compliant with the specified event
     * type in the portlet deployment descriptor.
     * <p>
     * The value must have a valid JAXB binding and be serializable.
     * 
     * @param name
     *            the local part of the event name to publish, must not be <code>null</code>
     * @param value
     *            the value of this event, must have a valid JAXB binding and 
     *            be serializable, or <code>null</code>.
     * 
     * @exception java.lang.IllegalArgumentException
     *                if name is <code>null</code>, the value is not
     *                serializable, the value does not have a valid JAXB binding, the
     *                object type of the value is not the same as specified in
     *                the portlet deployment descriptor for this event name.
     * @since 2.0
     */
	public void setEvent(String name, java.io.Serializable value);


	/**
     * Returns a <code>Map</code> of the render parameters currently set on
     * this response.
     * <p>
     * The values in the returned <code>Map</code> are from type String array (<code>String[]</code>).
     * <p>
     * If no parameters exist this method returns an empty <code>Map</code>.
     * 
     * @since 2.0
     * 
     * @return <code>Map</code> containing render parameter names as keys and
     *         parameter values as map values, or an empty <code>Map</code> if
     *         no parameters exist. The keys in the parameter map are of type
     *         String. The values in the parameter map are of type String array (<code>String[]</code>).
     */

	public java.util.Map<String, String[]> getRenderParameterMap();

	/**
     * Returns the currently set portlet mode on this reponse.
     * 
     * @since 2.0
     * 
     * @return the portlet mode, or <code>null</code> if none is set
     */

	public PortletMode getPortletMode();

	/**
     * Returns the currently set window state on this response.
     * 
     * @since 2.0
     * 
     * @return the window state, or <code>null</code> if none is set
     */

	public WindowState getWindowState();


	/**
	 * Removes the specified public render parameter.
	 * The name must reference a public render parameter defined
	 * in the portlet deployment descriptor under the
	 * <code>public-render-parameter</code> element with the
	 * <code>identifier</code> mapping to the parameter name.
	 * 
	 * @param name			a <code>String</code> specifying 
	 *					the name of the public render parameter to be removed
	 *
	 * @exception  java.lang.IllegalArgumentException 
	 *                            if name is <code>null</code>.
	 * @since 2.0
	 */
	public void removePublicRenderParameter(String name);
}
