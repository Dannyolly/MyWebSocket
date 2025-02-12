import AsyncStorage from '@react-native-async-storage/async-storage';
import React,{useEffect} from 'react'
import { View, Text } from 'react-native'
import { getUserMainInfo, objTOParams } from '../util/function';

import { chatMsg, PULL_FRIEND } from '../pages/Message/MessageHandler';
import { CONNECT ,KEEPALIVE} from '../pages/Message/MessageHandler';


import { EventEmitter } from '@unimodules/react-native-adapter';

import { getMsgFormat } from '../pages/Message/MessageHandler';
import { online, searchUser } from '../api/api';
import { DeviceEventEmitter } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { base_url } from '../api/config';

import MessageIcon from '../components/MessageIcon'
import { userStore } from '../mobx/store';




//const webSocketPath= 'ws://3kq8557234.zicp.vip:13044/ws'
const webSocketPath  = 'http://websocket.free.svipss.top/ws'

const ws = new WebSocket(webSocketPath);

const onopen=(e)=>{
    getUserMainInfo().then(res=>{
        console.log('open!!!!',res)
        ws.send(JSON.stringify(chatMsg(CONNECT,res.userInfo.id,0,'','')))
        console.log('send Connect MSG')


        online(res.userInfo.id,1).then(res=>{
            /* showMessage({
                message:JSON.stringify(res.data)
            }) */
        })


        // 長連接..
        /* setInterval(()=>{
            let serverMsg =  chatMsg(KEEPALIVE,res.userInfo.id)
            ws.send(JSON.stringify(serverMsg))
            //console.log('send Heart bead package')
        },10000) */

        }
    )


    /**
     * 定時發送心跳包... 10秒
     */
    
}


const receiveChatMessage = async (msg) =>{
    let params = objTOParams({
        id:msg.sendUserId
    })
    let res = await searchUser(params)
    let formatMsg
    let flag 
    if(msg.msg.substring(0,1) === "/"){
        flag=false
        formatMsg = getMsgFormat(undefined,res.data[0],msg.msg,true)
    }else{
        flag=true
        formatMsg = getMsgFormat(msg.msg,res.data[0])
    }
    

    // receiveMsg --> Home.jsx
    /**
     * @link {./home.jsx}
     */
    DeviceEventEmitter.emit('receiveMsg',formatMsg)

    showMessage({
        icon:'info',
        /* style: {
            height: 40,
            backgroundColor: "#8C8E8F",
            width: screenSize.width - 20,
            borderRadius: 10,
            paddingLeft: 20,
            left: 10,
            top: 40,
        }, */
        message:formatMsg.user.name,
        description:flag?formatMsg.text:"[ 圖片 ]",
        renderFlashMessageIcon:(icon,style,image)=>
        // @ts-ignore
        <MessageIcon icon={icon} style={style} image={formatMsg.user.avatar}/>,
        /* style:{
            backgroundColor:"#8C8E8F",
          height:75,
          width:screenSize.width-20,
          borderRadius:10,
          paddingLeft:20,
          left:10,
          top:40,
        } */
        textStyle:{
            padding:30,
            paddingLeft:31,
            paddingBottom:0
        }
        /* titleStyle:{lineHeight:30,fontSize:18,fontWeight:'400'} */
        
    })
    userStore.setUnReadMessageCount(userStore.unreadMessageCount + 1)
    console.log(userStore.unreadMessageCount)
}

const initOnMessage = async (e)=>{
    let msg =JSON.parse(e.data)

    if(msg.action!==undefined  && msg.action === PULL_FRIEND ){
        // 好友請求...
        userStore.setFriendRequestDidNotRead(userStore.friendRequestDidNotReadNumber+1)  

    }else{

        // 聊天信息..
        receiveChatMessage(msg)
    }

    
}

const onerror = (e) => {
// an error occurred
    console.log(e.message);
};

const onclose = (e) => {
// connection closed
    
};

ws.onerror=onerror
ws.onclose=onclose
ws.onopen=onopen
ws.onmessage=initOnMessage

export{
    ws,
    webSocketPath,
    onerror,
    onclose,
    onopen,
    initOnMessage
}


    



