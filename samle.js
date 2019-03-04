if(syncResult.getSuccess()) {
    console.log("Sync trigger successful.");

    isSyncComplete = APOS.util.POSApplet.isSyncComplete();
    console.log("Is sync complete? "+isSyncComplete);

    var loadingInterval = setInterval(function () {
        if(!isSyncComplete && numAttempts < 600){
            numAttempts += 1;
            console.log("Is sync complete? " + isSyncComplete);
            isSyncComplete = APOS.util.POSApplet.isSyncComplete();
        } else if(isSyncComplete) {
            clearInterval(loadingInterval);
            container.setSyncLoadingInterval(null);

            var syncMessage = "Sync Complete";
            
            if(isSyncComplete) {
                console.log("Sync completed");

                var deviceInfoNew = APOS.util.POSApplet.getDeviceInfo();
                var deviceInfo = APOS.util.DeviceInfoService.getDeviceInfo();
                
                var lastCDSSyncWasSuccess = deviceInfoNew.LAST_SYNC_WAS_SUCCESS;
                if(lastCDSSyncWasSuccess === true) {
                    console.log("Sync success");
                    syncMessage = "Sync Completed Successfully";
                    deviceInfo.data.CURRENT_UNSYNCED_TRANSACTION_VALUE=0;
                    deviceInfo.data.CURRENT_UNSYNCED_TRANSACTION_NUMBER=0;
                    
                } else {
                    console.log("Sync error");
                    syncMessage = "An error occurred during sync";
                }
                
            } else {
                console.log("Sync Timed Out");
                syncMessage = "Sync timed out.";
            }

            container.down('#mainText').setHtml(syncMessage);
            container.down('#OKbutton').show();
            
        }
    }, 1000);
    
    container.setSyncLoadingInterval(loadingInterval);
    
} else {
    console.log("Failed to sync, message: "+result.getMessage());
    container.down('#mainText').setHtml("Failed to trigger sync.");
}
