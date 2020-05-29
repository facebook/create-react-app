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
 * The <code>Event</code> interface represents an event that the portlet has received
 * in the event processing phase.
 * <p>
 * The <code>Event</code> interface encapsulates the event name and event payload,
 * it does not represent the event object itself.
 * <p>
 * The portlet must define the events it is able to receive in the portlet deployment
 * descriptor with the <code>supported-processing-event</code>.
 * 
 * @since 2.0
 * @see EventPortlet
 */
public interface Event {
    
    /**
     * Get the event QName.
     * 
     * @return  the QName of the event, never <code>null</code>.
     */
    public javax.xml.namespace.QName getQName();

    /**
     * Get the local part of the event name.
     * 
     * @return  the local part of the event, never <code>null</code>.
     */
    public java.lang.String getName();

    /**
     * Get the event payload.
     * 
     * @return  event payload, must be serializable.
     *          May return <code>null</code> if this event has no payload.
     */
    public java.io.Serializable getValue();
   
}
