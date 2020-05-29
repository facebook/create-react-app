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
 * The <CODE>EventRequest</CODE> represents the request sent to the portlet
 * to handle an event.
 * It extends the PortletRequest interface to provide event request
 * information to portlets.<br>
 * The portlet container creates an <CODE>EventRequest</CODE> object and
 * passes it as argument to the portlet's <CODE>processEvent</CODE> method.
 * 
 * @see ActionRequest
 * @see PortletRequest
 * @since 2.0
 */
public interface EventRequest extends PortletRequest {

    /**
     * Returns the event that triggered the call to the processEvent method.
     * 
     * @return      the event that triggered the current processEvent call. 
     */
    
    public Event getEvent();
    
    /**
     * Returns the name of the HTTP method with which the original action request was made, 
     * for example, POST, or PUT.
     * 
     * @since 2.0
     * @return  a String specifying the name of the HTTP method with which 
     *          this request was made
     */
    public String getMethod();

}
