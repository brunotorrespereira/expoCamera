import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, StatusBar, Text, TouchableOpacity, Modal,Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission } 
from 'react-native-vision-camera';
import { Video, ResizeMode} from 'expo-av';
import * as MediaLibrary from 'expo-media-library';

const { width: widthScreen, height: heightScreen} = Dimensions.get('screen')

export default function App() {
  const device = useCameraDevice('back');
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } 
  = useCameraPermission();
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } 
  = useMicrophonePermission();
  const [permission, setPermission] = useState<boolean | null>(null);
  const [ isRecording, setIsRecording] = useState(false)
  const [ videoUri, setVideoUri] = useState<string | null>(null);
  const [ modalVisible, setModalVisible] = useState(false)


  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await requestCameraPermission();
      const micStatus = await requestMicPermission();

      if (cameraStatus && micStatus) {
        setPermission(true);
      } else {
        setPermission(false);
      }
    const { status: statusMediaLibrary} = await MediaLibrary.requestPermissionsAsync();
     if(statusMediaLibrary !== 'granted'){

      console.log('Media Library Nao Autorizado')
      setPermission(false);
      return
     
     }


    })();
  }, []);

const startRecording = () => {
if(!cameraRef.current || !device) return;
  setIsRecording(true)

  cameraRef.current.startRecording({
    onRecordingFinished: (video) => {
      setIsRecording(false)
      setVideoUri(video.path)
      setModalVisible(true)
      console.log('Video URI:', video.path);
    },
    onRecordingError: (error) => {
      console.log("Deu Erro:");
      console.log(error)
    }
    
  })
}

const stopRecording = async () => {
  if(cameraRef.current){
   await cameraRef.current.stopRecording()
   setIsRecording(false)
  }
}

function handleCloseModal(){
  setModalVisible(false);
}

const handleSaveVideo = async () => {
if(videoUri){
  try{
    await MediaLibrary.createAssetAsync(videoUri)
    console.log('Salvo com Sucesso')
  } catch(error){
    console.log('Erro ao Salvar')
    console.log(error)
  }
 }
}



  if (permission === null) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Text>Requesting permission...</Text>
      </View>
    );
  }

  if (permission === false) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Text>Permission denied</Text>
      </View>
    );
  }

  if (!device || device === null) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Text>No camera found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Camera
        style={StyleSheet.absoluteFill}
        ref={cameraRef}
        device={device}
        isActive={true}
        video={true}
        audio={true}
        orientation="portrait"
        resizeMode="cover"
      />
     
    <TouchableOpacity
      onPressIn={startRecording}
      onPressOut={stopRecording}
      style={{
        width: 70,
        height:70,
        borderRadius: 99,
        borderWidth:4,
        borderColor: 'red',
        position: 'absolute',
        bottom: 15,
        alignSelf:'center',
        zIndex: 1,
        
      }}
      />
      
   {videoUri && (
    <Modal
      animationType='slide'
      transparent={false}
      visible={modalVisible}
      onRequestClose={handleCloseModal}
    >
    <View style={styles.videoContainer}>
      <Video
       source={{uri: videoUri}}
       rate={1.0}
       volume={1.0}
       isMuted={false}
       shouldPlay
       isLooping
       resizeMode={ResizeMode.COVER}
       style={{ width: widthScreen, height: heightScreen}}
      
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCloseModal}>
          <Text style={{color:'#000'}}>Fechar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSaveVideo}>
          <Text style={{color:'#000'}}>Salvar Video</Text>
        </TouchableOpacity>
      </View>

    </View>

   </Modal>
   )}
    
   </View>
  );
}

 const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  videoContainer:{
    flex:1,
    width:'100%',
    height:'100%'
  },
  button:{
   backgroundColor:'#fff',
   paddingLeft:24,
   paddingRight:24,
   paddingTop:8,
   paddingBottom:8,
   top: 24,
   left:24,
   borderRadius:4
  },
  buttonContainer:{
   position:'absolute',
   zIndex:99,
   flexDirection: 'row',
   gap:14
  },  
}); 







 