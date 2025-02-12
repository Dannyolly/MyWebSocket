import React,{useRef,useState,useEffect,useLayoutEffect,Component} from 'react'
import { StyleSheet, Text, View ,Image,Animated, Vibration} from 'react-native'
import { screenSize } from '../../util/screenSize'

import CachedImage from '../../components/NonIdCachedImage'
import { AntDesign, Feather , FontAwesome, Ionicons} from '../../util/Icon'
import ZoomableImage from '../../components/ZoomableImage'
import { base_url } from '../../api/config'
import { userStore } from '../../mobx/store'
import PropTypes from 'prop-types';
import MySwiper from '../../components/MySwiper'
import { getAllCommentCount, getPostByPostId, searchUser } from '../../api/api'
import { calculateDate, defaultShowMessage, getUserMainInfo, objTOParams } from '../../util/function'
import {TapGestureHandler  } from 'react-native-gesture-handler'
import { addLike,cancelLike,likeCheck } from '../../api/api'
import SkeletonView from '../../components/SkeletonView'
import LikeAnimated from '../../components/LikeAnimated'
import { showMessage } from 'react-native-flash-message'
import { tapResponser ,messageResponser, selectionResponser} from '../../util/haptic'
import { imageStore , observer } from '../../mobx/lock'
import PostItemSkeletonView from '../../components/PostItemSkeletonView'
import MaskView from '../../components/MaskView'
import AutoSizeMaskView from './AutoSizeMaskView'
import { LocalCacheManager } from '../../util/LocalCacheManager'
import { FormattedPost } from '../../util/type'



interface PostItemProps {

    item : FormattedPost ,

    index : number , 

    navigation : any ,

    isShadow : boolean ,

    currentTopOffset : number ,

    zooming : boolean ,

    onZooming : (scale: number , index : number )=> void ,

    setOpenBottomSheet : ()=>void

}


function PostItem({
    item ,
    index , 
    navigation,
    isShadow, 
    currentTopOffset , 
    zooming ,
    onZooming  ,
    setOpenBottomSheet
}:PostItemProps) {

    
    

    const [realItem, setItem] = useState(undefined)

    const correctFirstTime =useRef(false)


    const [showLike, setShowLike] = useState(false)


    const [liked, setLiked] = useState(false)

    const [icon, setIcon] = useState('')
    
    const [likeCount, setLikeCount,] = useState(0)
    
    const [commentCount, setCommentCount] = useState(false)

    const [isCollection, setIsCollection] = useState(false)

    const viewRef = useRef<any>();

    /**
     * @description 雙擊事件...
     */
    const doubleTapEvent = async ()=>{

        /* Vibration.vibrate([0,5],false); */
        tapResponser()
        /* selectionResponser() */
        /* messageResponser() */

        if(liked===false){
            setShowLike(()=>true)
            setLiked(()=>true)
            setTimeout(()=>{
                setShowLike(()=>false)
            },1000)
            setLikeCount(()=>likeCount+1)
            addLike(item.id,item.userId,realItem.likeCount+1).then(res=>{
                defaultShowMessage({
                    message:"successful"
                })
            })
        }else{
            setLiked(()=>false)
            setLikeCount(()=>likeCount-1)
            cancelLike(item.id,item.userId,realItem.likeCount-1).then(res=>{
                defaultShowMessage({
                    message:"已取消"
                })
            })
        }
    }



    /**
     * @description 檢查是否已點過讚...
     */
    const checkLike= async ()=>{
        
        const user = await getUserMainInfo()

        likeCheck(item.id,user.userInfo.id ).then(res=>{
            if(res.data!==undefined && res.data!==null && res.data!== '' && res.data.id!==0){       
                setLiked(()=>true)
            }
        })
        
        
    }

    const getData=()=>{
        getAllCommentCount(item.id).then(res=>{
            /* showMessage({
                message:JSON.stringify(res.data)
            }) */

            setCommentCount(()=>res.data)
        })
    }

    /**
     * @description 同步...
     */

    useEffect(() => {
        (async()=>{
            if(item!==undefined && correctFirstTime.current===false){
                correctFirstTime.current  = true
                getNewAvatar(userStore.userInfo.userInfo.id)
                getNewLike(item.id)
                setItem(()=>item)
            }
        })()
    }, [item])



    useEffect(()=>{

        (async ()=>{

            await checkIsCollection()?setIsCollection(()=>true):undefined

        })()

    },[realItem])


    const checkIsCollection = async ( ) =>{
        return await LocalCacheManager.checkPostSavedToCollection(userStore.userInfo.userInfo.id,item.id)
    }

    /**
     * 保存到收藏...
     */
    const saveToCollection = async (  ) =>{

        await tapResponser()
        await LocalCacheManager.savePostToCollection(item, userStore.userInfo.userInfo.id)
        setIsCollection(()=>true)
        defaultShowMessage({
            message:'收藏成功~'
        })

    }

    /**
     * @description 獲取新頭像 .... 發現新BUG 
     */
    const getNewAvatar = async ( id ) =>{

        let userInfo  = await searchUser(objTOParams({id:id}))

        setIcon(()=>userInfo.data[0].icon)
    }

    /**
     * @description 獲取新like數 .... 發現新BUG  
     */
    const getNewLike = async ( postId ) =>{

        let post = await getPostByPostId(postId)
        
        setLikeCount(()=>post.data.likeCount)
    } 



    useEffect(() => {
        getData()
        checkLike()
        
    }, [])

    /* if(realItem!==undefined){
        console.log(base_url+realItem.userInfo[0].icon)
    } */
    

    return (
        
            <View style={[styles.itemContainer,isShadow===true?styles.shadowStyle:{}]}>
                {/* {
                    index === 0
                    &&
                    <AutoSizeMaskView/>
                } */}
                {
            
                realItem!==undefined
                &&
                <View style={[styles.itemContent,isShadow===true?{padding:10,paddingTop:0,borderRadius:20}:{},index===0?{paddingTop:10}:{}]}>          
                        <View style={{flexDirection:'row',paddingLeft:10,marginBottom:5,zIndex:0}}>
                                
                                {
                                    icon!==''
                                    &&
                                    <CachedImage style={styles.iconStyle}  uri={base_url+icon} />
                                }
                                
                                {
                                    
                                    <Text style={{paddingLeft:10,lineHeight:40,fontWeight:'bold'}}>{realItem.userInfo[0].username}</Text>
                                }
                                <Feather name="more-horizontal" onPress={setOpenBottomSheet} style={{position:'absolute',right:isShadow===true?0:-10,fontSize:24,lineHeight:40/* ,color:"#CDCDCD" */}} />
                            </View> 
                        <View style={{zIndex:imageStore.index===index?1000000000000:0}}  ref={c=>viewRef.current=c}  >
                            {
                                
                                <AutoSizeMaskView index={index}  />
                            }
                            <View style={{zIndex:2}}>
                                <MySwiper 
                                   //@ts-ignore
                                    zooming={zooming} 
                                    onZooming={onZooming} 
                                    index={index} 
                                    currentTopOffset={currentTopOffset}  
                                    isJustify={isShadow}  
                                    data={realItem.postImage} 
                                    style={isShadow===true?styles.shadowStylePostImage:styles.postImage} 
                                    doubleTapEvent={doubleTapEvent} 
                                />
                            </View>
                        </View>
                        
                        {/* LIke VIew */}
                        {
                        showLike===true
                        &&
                        <View style={{position:'absolute',width:screenSize.width,top:70,zIndex:10000000000000,height:400,backgroundColor:"transparent",justifyContent:'center',alignItems:'center'}} >
                            <LikeAnimated  />
                        </View>
                        }

                    <View style={{flexDirection:'row',paddingTop:15,paddingLeft:15,alignItems:"center"}}>
                        <AntDesign  name={liked?'heart':'hearto'} style={{fontSize:23,marginRight:20,color:liked?"#FF1C45":"black",fontWeight:'500'}} />
                        <FontAwesome name="comment-o" style={{fontSize:23,marginRight:20,fontWeight:'500'}} />
                        <Feather name="send" style={{fontSize:22,fontWeight:'500',paddingTop:3}} />
                        {
                            isCollection?
                            <FontAwesome name="bookmark" style={{color:'#28C1FD',fontSize:26,fontWeight:'900',position:'absolute',right:-5,bottom:-3}} />
                            :
                            <FontAwesome name="bookmark-o" onPress={saveToCollection} style={{fontSize:26,fontWeight:'900',position:'absolute',right:-5,bottom:-3}} />
                        }
                    </View>
                    {
                        
                        <Text style={{padding:15,paddingTop:12,paddingBottom:0,zIndex:0,fontWeight:'600'}}>
                            {likeCount} 讚好
                        </Text>
                    }
                    <Text style={{padding:15,paddingTop:5,paddingBottom:0,zIndex:0,fontWeight:'600'}}>
                        {realItem.userInfo[0].username}: {realItem.introduction}
                    </Text>
                    <Text onPress={()=>navigation.navigate('comment',{

                        userId:userStore.userInfo.userInfo.id,
                        postId:realItem.id,
                        item:realItem,
                        icon:icon,
                        likeCount:likeCount,
                        liked:liked

                    })} selectionColor="#FFFFFF" style={{padding:15,paddingTop:5,paddingBottom:5,color:"#CDCDCD",zIndex:0,fontWeight:'500'}}>
                        查看{commentCount}則留言
                    </Text>
                    <Text style={{paddingLeft:15,color:"#CDCDCD",fontSize:13,zIndex:0}}>
                        {calculateDate(realItem.postDate)}
                    </Text>
                </View>
                }

                
                {/* {
                    realItem===undefined
                    &&
                    <PostItemSkeletonView/>
                } */}
                
                   
            
            
            </View>

    )
}




export default observer(PostItem)

const styles = StyleSheet.create({
    shadowStyle:{
        /* shadowColor:"#FFFFFF",
        shadowOpacity:1,
        shadowOffset:{
            width:0,
            height:5
        },
        shadowRadius:0, */
        borderRadius:10,
        backgroundColor:"#FFFFFF",
        marginBottom:20
    },
    itemContainer:{
        width:screenSize.width-20,
        flex:1,
        marginBottom:5,
    },
    itemContent:{
        width:screenSize.width-20,
        borderRadius:20,
        flex:1,
        paddingTop:20,
        
    },
    iconStyle:{
        width:35,
        height:35,
        borderRadius:30,
        /* zIndex:0 */
    },
    postImage:{
        width:screenSize.width,
        height:500,
        /* zIndex:4 */
    },
    shadowStylePostImage:{
        width:screenSize.width-40,
        borderRadius:10,
        height:350,
        /* zIndex:4 */
    },

    // skeleton UI

    textStyle:{
        width:150,
        height:20,
        borderRadius:20
    }
})
