/// <reference path="../../libs/js/property-inspector.js" />
/// <reference path="../../libs/js/utils.js" />
/// <reference path="../../libs/js/action.js" />

let settings;
let global_settings;

console.log("Property Inspector loaded", $PI);

$PI.onConnected((jsn) => {
  console.log("Property Inspector connected", jsn);
  console.log(jsn.actionInfo.payload.settings);

  settings = jsn.actionInfo.payload.settings;
  if (settings.keyFunction) {
    document.querySelector("#keyfunction").value = settings.keyFunction;
  } else {
    document.querySelector("#keyfunction").value = "0";

    const payload = {
      keyFunction: 1,
    };

    $PI.setSettings(payload);
  }

  let actionUUID = $PI.actionInfo.action;
  // register a callback for the 'sendToPropertyInspector' event
  $PI.onSendToPropertyInspector(actionUUID, (jsn) => {
    console.log("onSendToPropertyInspector", jsn);
    sdpiCreateList(document.querySelector("#runningAppsContainer"), {
      id: "runningAppsID",
      label: "Running Apps",
      value: jsn.payload.runningApps,
      type: "list",
      selectionType: "no-select",
    });
  });

  $PI.getGlobalSettings();
});

document.querySelector("#keyfunction").addEventListener("change", (event) => {
  const selectedValue = event.target.value;
  console.log("Selected key function:", selectedValue);

  const payload = {
    keyFunction: selectedValue,
  };

  $PI.setSettings(payload);
});

$PI.onDidReceiveGlobalSettings((jsn) => {
  global_settings = jsn.payload.settings;

  console.log("Global settings received", global_settings);
});

/**
 * Provide window level functions to use in the external window
 * (this can be removed if the external window is not used)
 */
window.sendToInspector = (data) => {
  console.log(data);
};

// Open the external window
document.querySelector("#open-external").addEventListener("click", () => {
  const modal = window.open("../../external.html", "DHD Settings");
  modal.onload = () => {
    console.log(
      "Sending IP address to external window:",
      global_settings.ipAddress,
      global_settings.token,
    );

    modal.postMessage(
      { ipAddress: global_settings.ipAddress, token: global_settings.token },
      "*",
    );
  };
});
// Listen for messages from the external window
window.addEventListener("message", (event) => {
  if (event.data && event.data.ipAddress) {
    console.log(
      "Received IP address from external window:",
      event.data.ipAddress,
      event.data.token,
    );

    // Save the IP address using Stream Deck's setSettings method
    const globalSettings = {
      ipAddress: event.data.ipAddress,
      token: event.data.token,
    };

    $PI.setGlobalSettings(globalSettings);
  }
});
