import CryptoJS from 'crypto-js';
import {StyleSheet} from "react-native";
import {FileSystem} from "expo";
import moment from "moment/moment";
import { DangerZone } from "expo"
const { Branch } = DangerZone;
import {DOWNLOAD_FOLDER_PATH} from "../constants";
import {receiveAPI, requestAPI} from "../action/common.action";


export function validateEmail(email) {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
}

const generateKey = (SALT, PASSPHRASE, KEYSIZE, ITERATIONCOUNT) => {
    return CryptoJS.PBKDF2(
        PASSPHRASE,
        CryptoJS.enc.Hex.parse(SALT),
        {keySize: KEYSIZE, iterations: ITERATIONCOUNT}
    );
};

const decrypt = (IV, SALT, EXCRYPTEDTEXT, PASSPHRASE, KEYSIZE, ITERATIONCOUNT) => {
    const key = generateKey(SALT, PASSPHRASE, KEYSIZE, ITERATIONCOUNT);
    return CryptoJS.AES.decrypt(
        EXCRYPTEDTEXT,
        key,
        {iv: CryptoJS.enc.Hex.parse(IV)}
    ).toString(CryptoJS.enc.Utf8);
};

export const handleDecrypt = (IV, SALT, EXCRYPTEDTEXT, PASSPHRASE, KEYSIZE, ITERATIONCOUNT) => {
    const decryptedText = decrypt(IV, SALT, EXCRYPTEDTEXT, PASSPHRASE, KEYSIZE, ITERATIONCOUNT);
    return decryptedText;
};

export const clImageUrl = (url, options, defaultUrl) => {
    if (!url && defaultUrl) {
        url = defaultUrl;
        // return defaultUrl;
    }
    if (!url || !options || typeof options != "object") {
        return url;
    }
    let customUrl = '';
    if (options.width) {
        customUrl = "w_" + options.width + ","
    }
    if (options.height) {
        customUrl += "h_" + options.height + ","
    }
    if (!customUrl) {
        return url;
    }
    // console.log("new url >>>> ", url.replace("/upload", "/upload/" + customUrl.slice(0,customUrl.length - 1 )) );
    return url.replace("/upload", "/upload/" + customUrl.slice(0, customUrl.length - 1));
};


export function convertSecToMins(time) {
    if (!time) {
        return "00:00";
    }

    let minutes = parseInt(time / 60);
    let seconds = parseInt(time % 60);
    return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);

}


export function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

export const getDate = (timeStamp) => {
    const date = moment(timeStamp).format('D-MMM-YYYY');
    return date;
};
export const getTime = (timeStamp) => {
    const time = moment(timeStamp).format('h:mm:A');
    const timeArray = time.split(':');
    const eventTime = timeArray[1] > 0 ? timeArray[0] + ':' + timeArray[1] + timeArray[2] : timeArray[0] + timeArray[2];
    return eventTime;
};

export function convertSecToHoursAndMins(time) {
    if (!time) {
        return "00:00";
    }
    let hours = parseInt(time / 3600);
    let minutes = parseInt((time -(hours * 3600)) / 60);
    return (hours < 10 ? "0" + hours : hours) + " " + "Hr" + " " + (minutes < 10 ? "0" + minutes : minutes) + " " + "Minutes";

}


export const createBranchUniversalObject = async () => {
  this._branchUniversalObject = await Branch.createBranchUniversalObject("id-1",
    {
      title: 'Hcl-Concerts',
      contentDescription: 'Only Place where u can Listen to one of world\'s best classical music',
      contentImageUrl: 'https://pbs.twimg.com/profile_images/645946742282674177/PvuF2ybo.png',
      // This metadata can be used to easily navigate back to this screen
      // when implementing deep linking with `Branch.subscribe`.
      metadata: {
        screen: 'MyNotification',
        params: null,
      },
    }
  );
  onShareLinkPress();
};

const onShareLinkPress = async () => {
  const shareOptions = {
    messageHeader: 'HCL CONCERTS !',
    messageBody: `Checkout my new sharing app !!! YO !!!`,
  };
  await this._branchUniversalObject.showShareSheet(shareOptions).then(res => {
    console.log('res-------------------------->', res);
  });
};
export const downloadSong = (item) => async (dispatch) => {
    console.log(`uri for download :${item.itemUrl}`);
    console.log(`location for download: ${DOWNLOAD_FOLDER_PATH}`);
    Expo.FileSystem.getInfoAsync(DOWNLOAD_FOLDER_PATH, {md5: false}).then((result) => {
        if(result.exists
)
    {
        console.log(`download folder exists`);
        downloadAsyncOrcreateDownloadResumable(item, dispatch, true);

    }
else
    {
        console.log(`download folder doesnt exists creating folder`);
        Expo.FileSystem.makeDirectoryAsync(DOWNLOAD_FOLDER_PATH).then(() => {
            console.log(`download folder created`);
        downloadAsyncOrcreateDownloadResumable(item, dispatch, true);
    })
        ;


    }

}
)




}

function downloadAsyncOrcreateDownloadResumable(item, dispatch, useDownloadResumable) {
    console.log(`download value of useDownloadResumable :${useDownloadResumable} `);
    if (useDownloadResumable) {
        downloadSongUpdateProgress(item, dispatch).then(() => {
            dispatch(receiveAPI());
        });
    } else {
        downloadAsync(item, dispatch);
    }
}

function createSongPath(item) {
    let songNameArray = item.itemName.split(" ");
    let songPath = DOWNLOAD_FOLDER_PATH + "/" + songNameArray[0] + ".mp3";
    item.songPath = songPath;
}

function downloadAsync(item, dispatch) {
    createSongPath(item);
    Expo.FileSystem.downloadAsync(
        item.itemUrl,
        item.songPath
    )
        .then(({uri}) => {

        dispatch(receiveAPI());
            console.log('download Finished downloading to ', uri);
        })
        .catch(error => {
            dispatch(receiveAPI());
            console.error(error);
        });
}

//This method provides the ability to report the % of content downloaded .
export async function downloadSongUpdateProgress(item, dispatch) {
    const callback = downloadProgress => {
        const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
        console.log(`download progress is ${progress}`);
    };

    createSongPath(item)
    const downloadResumable = FileSystem.createDownloadResumable(
        item.itemUrl, item.songPath
        ,
        {},
        callback
    );

    try {
        const {uri} = await downloadResumable.downloadAsync();
        console.log('download Finished downloading to ', uri);
    } catch (e) {
        console.log("error in downloadSongUpdateProgress");
        console.error(e);
    }

    dispatch(receiveAPI());
    /*try {
        await downloadResumable.pauseAsync();
        console.log('Paused download operation, saving for future retrieval');
        AsyncStorage.setItem(
            'pausedDownload',
            JSON.stringify(downloadResumable.savable())
        );
    } catch (e) {
        console.error(e);
    }

    try {
        const { uri } = await downloadResumable.resumeAsync();
        console.log('Finished downloading to ', uri);
    } catch (e) {
        console.error(e);
    }

//To resume a download across app restarts, assuming the the DownloadResumable.savable() object was stored:
    const downloadSnapshotJson = await AsyncStorage.getItem('pausedDownload');
    const downloadSnapshot = JSON.parse(downloadJson);
    const downloadResumable = new FileSystem.DownloadResumable(
        downloadSnapshot.url,
        downloadSnapshot.fileUri,
        downloadSnapshot.options,
        callback,
        downloadSnapshot.resumeData
    );

    try {
        const { uri } = await downloadResumable.resumeAsync();
        console.log('Finished downloading to ', uri);
    } catch (e) {
        console.error(e);
    }*/

}





