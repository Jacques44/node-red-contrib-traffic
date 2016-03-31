/*
  Copyright (c) 2016 Jacques W.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

module.exports = function(RED) {

  function TrafficNode(config) {

    RED.nodes.createNode(this, config);
    var node = this;

    // context is necessary to store the node state
    var context = this.context();

    // changing state function
    this.state = function(passing) {

      // store the new state
			context.set('pass', passing);

      // change the circle below to reflect the new state
			if (passing) {
				this.status({fill: "green", shape: "dot", text: "allow"});
			} else {
				this.status({fill: "red", shape: "dot", text: "stop"});
			}
		}

    // Default state according to the configuration
    this.state(config.default_start);

    // Build "allow" regex
    var options = (config.ignore_case_allow)?"i":"";
    var rx_allow = null;
    try {
      rx_allow  = new RegExp(config.filter_allow, options);
    }
    catch (exception) {
    }

    // Build "stop" regex
    var options = (config.ignore_case_stop)?"i":"";
    var rx_stop = null;
    try {
      rx_stop  = new RegExp(config.filter_stop, options);
    }
    catch (exception) {
    }    

    // If new message...
    this.on('input', function(msg) {

      // If value for the "allow" property for the incoming message has the right "allow" value ... 
      if (rx_allow != null && msg.hasOwnProperty(config.property_allow) && rx_allow.test(msg[config.property_allow])) {
        // State is changed to "allow"
    		this.state(true);
        // If needed, also send the input message
    		if (config.send_allow) node.send(msg);
        return;
    	}

      // If value for the "stop" property for the incoming message has the right "stop" value ...
    	if (rx_stop != null && msg.hasOwnProperty(config.property_stop) && rx_stop.test(msg[config.property_stop])) {
        // State is changed to "stop"
		    this.state(false);
        // If needed, also send the input message
    		if (config.send_stop) node.send(msg);  
        return;
    	}

      // Other cases, the message is sent only if in "allow" state
    	if (context.get('pass')) {
    		node.send(msg);	
    	}
        
    });

  }

  RED.nodes.registerType("traffic", TrafficNode);
}
