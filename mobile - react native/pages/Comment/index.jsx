import React,{useRef,useState,useCallback, useMemo,memo, useEffect,Component} from 'react'
import { StyleSheet, Text, View ,Image, Platform, Animated, Keyboard, Easing, KeyboardAvoidingView,} from 'react-native'
import { FlatList, ScrollView, TapGestureHandler, TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { screenSize } from '../../util/screenSize'


import CachedImage from '../../components/CachedImage'
import { userStore } from '../../mobx/store'
import { base_url } from '../../api/config'
import item from '../Friend/FriendList/item'
import MyFlatlist from './MyFlatlist'
import { addComment, getAllComment } from '../../api/api'

import { showMessage,hideMessage } from 'react-native-flash-message'
import { calculateDate, defaultShowMessage } from '../../util/function'

import { Feather ,AntDesign,FontAwesome} from '../../util/Icon'

import CommentHeader from '../../components/Header/Comment'

import { PanGestureHandler } from 'react-native-gesture-handler'
import MySwiper from '../../components/MySwiper'
import NonIdCachedImage from '../../components/NonIdCachedImage'
import MyTextInput from './textInput'

const index = ( {route , navigation, delayLoading,collapse, moveable } ) => {

    
    const { item , userId ,postId,  likeCount ,  liked , icon  } = route.params
    
    const { userInfo  } = item 

    const [data, setData] = useState(undefined)

    const offset =  useRef(new Animated.Value(0)).current

    const scrollRef =useRef(undefined)

    const commentContainerOffset= useRef(new Animated.Value(0)).current

    const touchX  =useRef(new Animated.Value(0)).current

    const touchY  =useRef(new Animated.Value(0)).current

    const currentTranslationX = useRef(0)

    const moving = useRef(false)

    const viewHeight = useRef(new Animated.Value(138)).current

    const viewWidth = useRef(new Animated.Value(138)).current

    const [isShowComment, setIsShowComment] = useState(false)

    const getComment =()=>{
        getAllComment(postId,0,10).then(res=>{
           // console.log(res.data)
            setData(()=>res.data)
        })
    }

    const submitMessage = (value) =>{
        
        collapseKeyBoard()
        setTimeout(()=>{
            let obj = {
                commentInfo:value,
                commetDate:new Date(),
                icon:userStore.userInfo.userInfo.icon,
                likeCount:0,
                postCommentId:null,
                postId:postId,
                userId:userId,
                username:userStore.userInfo.userInfo.username
            }
    
            setData(()=>[obj, ...data])
            console.log([obj, ...data])
            //onChangeText(()=>'')
    
            addComment(userId,postId,value).then(res=>{
                /* showMessage({
                    description:JSON.stringify(res.data),
                    message:'JSON',
                    type:"info"
                })   */    
            })
        },500)
    }



    useEffect(() => {
        //getComment()
        
        getComment()
            
        setTimeout(()=>{
            setIsShowComment(()=>true)
            
        },700)
        
    }, [])


    const onPanGestureEvent = Animated.event([
        { 
            nativeEvent: { translationX: touchX ,translationY: touchY}
        }], 
        {
            useNativeDriver: true,
             listener: e=>{
                //console.log(e.nativeEvent.translationX,touchX) 
                currentTranslationX.current=e.nativeEvent.translationX
             }
        }
    );
    
    const collapseKeyBoard = ()=>{
        Keyboard.dismiss()
    }

    const onPanFinished = () =>{
        //console.log('touchX',currentTranslationX)
        if(currentTranslationX.current>170){
            Animated.spring(touchX,{
                toValue:0,
                bounciness:4,
                useNativeDriver:true
            }).start()
    
            Animated.spring(touchY,{
                toValue:0,
                bounciness:4,
                useNativeDriver:true
            }).start()
            setTimeout(()=>{
                collapse()
            },200)
            
        }else{
            Animated.spring(touchX,{
                toValue:0,
                bounciness:4,
                useNativeDriver:true
            }).start()
    
            Animated.spring(touchY,{
                toValue:0,
                bounciness:4,
                useNativeDriver:true
            }).start()
        }
        
    }


    return (
        <>
            {
                moveable?
                <PanGestureHandler 
                onGestureEvent={onPanGestureEvent} 
                onEnded={()=>onPanFinished()}
                
                >
                    <Animated.View   
                        
                    
                        style={[styles.container,{transform:[{translateX:touchX}
                        ,{translateY:touchY}]}/* ,{borderRadius:40,overflow:'hidden'} */]} 
                    >
            
                                <Animated.View  
                                    style={{width:viewWidth,marginBottom:100,
                                
                                    transform:[{scale:Animated.divide( viewWidth ,screenSize.width)}],
                                }} 
                                    >
                                    <View style={{flex:1,paddingLeft:10,paddingRight:10}}>
                                        <CommentHeader icon={userInfo[0].icon}  collapse={collapse} item={item} />
                                    </View>
                                </Animated.View >
                            <ScrollView 
                            
                            /* scrollEventThrottle={16} 
                            onScroll={
                                    Animated.event(
                                        [
                                        {
                                            nativeEvent: {contentOffset: {y: commentContainerOffset }},
                                        },
                                        ],
                                        {useNativeDriver: false},
                                    )}   */
                                    style={{flex:1}} 
                                    /* contentContainerStyle={{flexGrow:1}} */
                                    showsVerticalScrollIndicator={false} 
                                    onLayout={e=>{
                                        console.log(e.nativeEvent.layout)
                                        viewWidth.setValue(e.nativeEvent.layout.width)
                                        viewHeight.setValue(e.nativeEvent.layout.height)
                                        
                                    }}
                                    >
                                    
                                    
                                    
                                    
                                        <Animated.View  style={{
                                            width:viewWidth,
                                            height:viewHeight
                                        }}
                                        >       
                                            
                                                
                                                    <NonIdCachedImage
                                                        uri={item.postImage[0]}
                                                        style={{flex:1}}
                                                    
                                                    />
                                                
                                                
                                                <Animated.View style={{flex:0.25,paddingTop:5,paddingLeft:5,paddingRight:5}} >
                                                    <View style={{flexDirection:'row',paddingTop:5,paddingLeft:10}}>
                                                        <AntDesign  name={liked?'heart':'hearto'} style={{fontSize:23,marginRight:20,color:liked?"#FF1C45":"black",fontWeight:'500'}} />
                                                        <FontAwesome name="comment-o" style={{fontSize:20}} />
                                                        
                                                    </View>
                                                    <Text style={{padding:10,paddingTop:12,paddingBottom:0,zIndex:0,fontWeight:'600'}}>
                                                        {likeCount} 讚好
                                                    </Text>
                                                    <Text style={{padding:10,paddingTop:5,paddingBottom:0,zIndex:0,fontWeight:'600'}}>
                                                        {item.userInfo[0].username}: {item.introduction}
                                                    </Text>
                                                    
                                                    <Text style={{paddingTop:10,paddingLeft:10,color:"#CDCDCD",fontSize:12,zIndex:0}}>
                                                        {calculateDate(item.postDate)}
                                                    </Text>
                                                </Animated.View>  
                                            
                                        </Animated.View>
                                        
                                        <Animated.View  
                                        style={{
                                            
                                            paddingLeft:10,
                                            paddingRight:20,height:1,marginBottom:20}}
                                        >
                                            <View style={{width:"95%",height:1,backgroundColor:"#F4F4F4",}}/>
                                        </Animated.View >
                                   
                                    
                                    
                                        
                                    {
                                        isShowComment
                                        &&
                                        <MyFlatlist 
                                            data={data} 
                                            offset={offset}
                                            collapseKeyBoard={collapseKeyBoard} 
                                        />
                                    }
                                        
                                    

                                    
                            </ScrollView>
                            <KeyboardAvoidingView style={{zIndex:1000,position:'absolute',bottom:0}} 
                                    keyboardVerticalOffset={0}
                                    behavior={Platform.OS == "ios" ? 'position' : "height"}>
                                        <Animated.View 
                                                style={{
                                                width:screenSize.width,
                                                height:80,
                                                paddingBottom:0,
                                                justifyContent:'center',
                                                paddingLeft:70,
                                                paddingBottom:10,
                                                backgroundColor:"#FFFFFF",
                                                //position:'absolute',
                                                shadowColor:"#CDCDCD",
                                                shadowRadius:2,
                                                shadowOpacity:0.7,
                                                shadowOffset:{
                                                    width:0,
                                                    height:0
                                                },
                                                zIndex:1000
                                                }}>
                                            
                                                    <NonIdCachedImage
                                                    uri={base_url+userStore.userInfo.userInfo.icon}
                                                    style={styles.userIcon}   />
                                                
                                                    <MyTextInput  
                                                        keyboardType={'twitter'}
                                                        returnKeyType='send'
                                                        onBlur={()=>collapseKeyBoard()}
                                          
                                                        onSubmitEditing={(value)=>submitMessage(value)}
                                     
                                                        placeholder={"新增回應......"} 
                                        
                                                         
                                                    />
                                                
                                        </Animated.View>
                                    </KeyboardAvoidingView>
                                    
                    </Animated.View>
                </PanGestureHandler>
                :
                <Animated.View  style={[styles.container,{transform:[{translateX:touchX},{translateY:touchY}]}/* ,{borderRadius:40,overflow:'hidden'} */]} >
                            <View style={{paddingLeft:10,paddingRight:10}}>
                                <CommentHeader icon={icon}  collapse={collapse} item={item} />
                             </View>
                            <Animated.ScrollView  scrollEventThrottle={16} onScroll={
                                    Animated.event(
                                        [
                                        {
                                            nativeEvent: {contentOffset: {y: commentContainerOffset}},
                                        },
                                        ],
                                        {useNativeDriver: false},
                                    )}  
                                    style={{flex:1}} 
                                    //contentContainerStyle={{flex:1}}
                                    showsVerticalScrollIndicator={false} 
                                    
                                    >
                                    
                                    
                                    <TouchableWithoutFeedback onPress={collapseKeyBoard} >
                                        
                                        {
                                        <View style={{width:screenSize.width,height:650}}>
                                                        
                                                <MySwiper /* isJustify={true} */ 
                                                data={item.postImage} 
                                                style={{width:screenSize.width,height:500}} />
                                            
                                            <View style={{paddingTop:5,paddingLeft:5,paddingRight:5}} >
                                                <View style={{flexDirection:'row',paddingTop:5,paddingLeft:10}}>
                                                    <AntDesign  name={liked?'heart':'hearto'} style={{fontSize:23,marginRight:20,color:liked?"#FF1C45":"black",fontWeight:'500'}} />
                                                    <FontAwesome name="comment-o" style={{fontSize:20}} />
                                                    
                                                </View>
                                                <Text style={{padding:10,paddingTop:12,paddingBottom:0,zIndex:0,fontWeight:'600'}}>
                                                    {likeCount} 讚好
                                                </Text>
                                                <Text style={{padding:10,paddingTop:5,paddingBottom:0,zIndex:0,fontWeight:'600'}}>
                                                    {item.userInfo[0].username}: {item.introduction}
                                                </Text>
                                                
                                                <Text style={{paddingTop:10,paddingLeft:10,color:"#CDCDCD",fontSize:12,zIndex:0}}>
                                                    {calculateDate(item.postDate)}
                                                </Text>
                                            </View>
                                        </View>
                                        }
                                        <View style={{width:screenSize.width,paddingLeft:10,paddingRight:20,height:1,marginBottom:20}}>
                                            <View style={{width:screenSize.width-40,height:1,backgroundColor:"#F4F4F4",}}/>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    
                                    {
                                        /* data!==undefined
                                        && */
                                        <MyFlatlist 
                                        data={data} 
                                        offset={offset}
                                        collapseKeyBoard={collapseKeyBoard} 
                                        />
                                        
                                    }

                                    
                            </Animated.ScrollView>
                            <KeyboardAvoidingView style={{zIndex:1000,position:'absolute',bottom:0}} 
                                    keyboardVerticalOffset={0}
                                    behavior={Platform.OS == "ios" ? 'position' : "height"}>
                                        <Animated.View 
                                                style={{
                                                width:screenSize.width,
                                                height:80,
                                                paddingBottom:0,
                                                justifyContent:'center',
                                                paddingLeft:70,
                                                paddingBottom:10,
                                                backgroundColor:"#FFFFFF",
                                                //position:'absolute',
                                                shadowColor:"#CDCDCD",
                                                shadowRadius:2,
                                                shadowOpacity:0.7,
                                                shadowOffset:{
                                                    width:0,
                                                    height:0
                                                },
                                                zIndex:1000
                                                }}>
                                            
                                                    <NonIdCachedImage
                                                    uri={base_url+userStore.userInfo.userInfo.icon}
                                                    style={styles.userIcon}   />
                                                
                                                    <MyTextInput  
                                                        keyboardType={'twitter'}
                                                        returnKeyType='send'
                                                        onBlur={()=>collapseKeyBoard()}
                                                        /* onTouchStart={()=>clickedKeyBoard()} */
                                                        onSubmitEditing={(value)=>submitMessage(value)}
                                                        /* onKeyPress={()=>clickedKeyBoard()} */
                                                        placeholder={"新增回應......"} 
                                                        //style={styles} 
                                                         
                                                    />
                                                
                                        </Animated.View>
                                    </KeyboardAvoidingView>
                    </Animated.View>
            }
        </>
    )
}

export default index

const styles = StyleSheet.create({
    itemContainer:{
        width:screenSize.width,
        flex:1,
        marginBottom:10,
        
    },
    itemContent:{
        paddingTop:150,
        borderRadius:20,
        flex:1,
        paddingTop:5,
        marginBottom:10
        
    },
    iconStyle:{
        width:40,
        height:40,
        borderRadius:30,
        zIndex:0
    },
    postImage:{
        
        zIndex:4,
    },
    container:{
        /* width:screenSize.width, */
        paddingTop:50,
        borderRadius:20,
        flex:1,
        backgroundColor:"#FFFFFF",
        padding:10,
        paddingTop:0,
        paddingLeft:0,
        paddingRight:0
    },
    icon:{
        width:35,
        height:35,
        borderRadius:20,
        position:'absolute',
        left:0
    },
    userIcon:{
        width:40,
        height:40,
        borderRadius:30,
        position:'absolute',
        left:15,
        bottom:25
    },
    input:{
        width:screenSize.width*0.73,
        padding:5,
        paddingLeft:10,
        height:40,
        borderRadius:10,
        backgroundColor:"#F4F4F4"
    }
})
