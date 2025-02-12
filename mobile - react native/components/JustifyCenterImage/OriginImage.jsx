import React , {MutableRefObject , memo,forwardRef} from 'react'
import { StyleSheet, Text, View } from 'react-native'


/** @param {{ref : MutableRefObject , tapPic: ()=>void ,ChildrenComponent:JSX.Element }} */
const OriginImage = forwardRef((props , ref) => {

    /** @type {()=>void} */
    const {tapPic ,ChildrenComponent  } = props


    return (
            ref!==undefined
            &&
            <View ref={c=>ref.current=c} onTouchEnd={tapPic}>
                <ChildrenComponent/>
            </View>
    )
})



export default OriginImage

const styles = StyleSheet.create({

})
