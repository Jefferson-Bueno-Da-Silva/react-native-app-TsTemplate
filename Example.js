import React, { Component, createRef } from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  PermissionsAndroid, 
  TouchableHighlight,
} from 'react-native';

import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo
} from 'react-native-twilio-video-webrtc';


export async function GetAllPermissions() {
  try {
    // if (Platform.OS === "android") {
      const userResponse = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ]);
      return userResponse;
    // }
  } catch (err) {
    console.log(err);
  }
  return null;
}

export default class Example extends Component {
  constructor(props){
    super(props);
    this.twilioVideo = createRef();
  }
  state = {
    isAudioEnabled: true,
    isVideoEnabled: true,
    isButtonDisplay: true,
    status: 'disconnected',
    participants: new Map(),
    videoTracks: new Map(),
    roomName: '',
    token: '',
  }
  
  componentDidMount() {
    GetAllPermissions();
  }

  _onConnectButtonPress = () => {
    // console.log("in on connect button preess");
    this.twilioVideo.current.connect({ roomName: this.state.roomName, accessToken: this.state.token})
    this.setState({status: 'connecting'})
    // console.log(this.state.status);
  }

  _onEndButtonPress = () => {
    this.twilioVideo.current.disconnect()
  }

  _onMuteButtonPress = () => {
    // on cliking the mic button we are setting it to mute or viceversa
    this.twilioVideo.current.setLocalAudioEnabled(!this.state.isAudioEnabled)
    .then(isEnabled => this.setState({isAudioEnabled: isEnabled}))
  }

  _onFlipButtonPress = () => {
    this.twilioVideo.current.flipCamera()
  }

  _onRoomDidConnect = () => {
    // console.log("room did connected");
    this.setState({status: 'connected'})
    // console.log("over");
  }

  _onRoomDidDisconnect = ({roomName, error}) => {
    // console.log("ERROR: ", JSON.stringify(error))
    // console.log("disconnected")
    
    this.setState({status: 'disconnected'})
  }

  _onRoomDidFailToConnect = (error) => {
    // console.log("ERROR: ", JSON.stringify(error));
    // console.log("failed to connect");
    this.setState({status: 'disconnected'})
  }

  _onParticipantAddedVideoTrack = ({participant, track}) => {
    // console.log("onParticipantAddedVideoTrack: ", participant, track)
    this.setState({
      videoTracks: new Map([
        ...this.state.videoTracks,
        [track.trackSid, { participantSid: participant.sid, videoTrackSid: track.trackSid }]
      ]),
    });
    // console.log("this.state.videoTracks", this.state.videoTracks);
  }

  _onParticipantRemovedVideoTrack = ({participant, track}) => {
    // console.log("onParticipantRemovedVideoTrack: ", participant, track)
    const videoTracks = this.state.videoTracks
    videoTracks.delete(track.trackSid)
    this.setState({videoTracks: { ...videoTracks }})
  }

  render() {
    return (
      <View style={styles.container} >
        {
          this.state.status === 'disconnected' &&
          <View>
            <Text style={styles.welcome}>
              React Native Twilio Video
            </Text>

            <View style={styles.spacing}>
              <Text style={styles.inputLabel}>Room Name</Text>
              <TextInput style={styles.inputBox}
              placeholder="Room Name"
              defaultValue={this.state.roomName}
              onChangeText={(text) => this.setState({roomName: text})}
              />
            </View>

            <View style={styles.spacing}>
              <Text style={styles.inputLabel}>Token</Text>
              <TextInput style={styles.inputBox}
              placeholder="Token"
              defaultValue={this.state.token}
              onChangeText={(text) => this.setState({token: text})}
              />
            </View>

            <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={this._onConnectButtonPress}>
              <Text style={styles.Buttontext}>Connect</Text>
            </TouchableHighlight>

          </View>
        }
        {
          (this.state.status === 'connected' || this.state.status === 'connecting') &&
          <View style={styles.callContainer}>
            {
              this.state.status === 'connected' &&
              <View style={styles.remoteGrid}>
                <TouchableOpacity style = {styles.remoteVideo} onPress={()=>{this.setState({isButtonDisplay:!this.state.isButtonDisplay})}} >
                {
                  Array.from(this.state.videoTracks, ([trackSid, trackIdentifier]) => {
                    return (
                        <TwilioVideoParticipantView
                          style={styles.remoteVideo}
                          key={trackSid}
                          trackIdentifier={trackIdentifier}
                        />
                    )
                  })
                }
                </TouchableOpacity>
                <TwilioVideoLocalView
                  enabled={true}
                  style = {this.state.isButtonDisplay ? styles.localVideoOnButtonEnabled : styles.localVideoOnButtonDisabled} 
                />
              </View>
            }
            <View
              style = {{
                display: this.state.isButtonDisplay ? "flex" : "none",
                position: "absolute",
                left: 0,
                bottom: 0,
                right: 0,
                height: 100,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-evenly",
                zIndex: this.state.isButtonDisplay ? 2 : 0,
              }} 
            >
              
              <TouchableOpacity
                style={{
                  display: this.state.isButtonDisplay ? "flex" : "none",
                  width: 60,
                  height: 60,
                  marginLeft: 10,
                  marginRight: 10,
                  borderRadius: 100 / 2,
                  backgroundColor: 'grey',
                  justifyContent: 'center',
                  alignItems: "center"
                }}
                onPress={this._onMuteButtonPress}
              >
                <Text style={{fontSize: 12, color: "#FFF" }} >{this.state.isAudioEnabled ? "mic" : "mic-off"} </Text>

              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  display: this.state.isButtonDisplay ? "flex" : "none",
                  width: 60,
                  height: 60,
                  marginLeft: 10,
                  marginRight: 10,
                  borderRadius: 100 / 2,
                  backgroundColor: 'grey',
                  justifyContent: 'center',
                  alignItems: "center"
                }}
                onPress={this._onEndButtonPress}>

                <Text style={{fontSize: 12, color: "#FFF" }} >Call-End</Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={
                    {
                      display: this.state.isButtonDisplay ? "flex" : "none",
                      width: 60,
                      height: 60,
                      marginLeft: 10,
                      marginRight: 10,
                      borderRadius: 100 / 2,
                      backgroundColor: 'grey',
                      justifyContent: 'center',
                      alignItems: "center"
                    }
                  }
                onPress={this._onFlipButtonPress}>

                <Text style={{fontSize: 12, color: "#FFF" }}> Flip </Text>
              
              </TouchableOpacity>
            </View>
          
          </View>
        }

        <TwilioVideo
          ref={this.twilioVideo}
          onRoomDidConnect={ this._onRoomDidConnect }
          onRoomDidDisconnect={ this._onRoomDidDisconnect }
          onRoomDidFailToConnect= { this._onRoomDidFailToConnect }
          onParticipantAddedVideoTrack={ this._onParticipantAddedVideoTrack }
          onParticipantRemovedVideoTrack= { this._onParticipantRemovedVideoTrack }
        />

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  callContainer: {
    flex: 1,
    position: "absolute",
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    minHeight:"100%"
  },
  welcome: {
    fontSize: 30,
    textAlign: 'center',
    paddingTop: 40
  },
  input: {
    height: 50,
    borderWidth: 1,
    marginRight: 70,
    marginLeft: 70,
    marginTop: 50,
    textAlign: 'center',
    backgroundColor: 'white'
  },
  button: {
    marginTop: 100
  },
  localVideoOnButtonEnabled: {
    bottom: ("40%"),
    width: "35%",
    left: "64%",
    height: "25%",
    zIndex: 2,
  },
  localVideoOnButtonDisabled: {
    bottom: ("30%"),
    width: "35%",
    left: "64%",
    height: "25%",
    zIndex: 2,
  },
  remoteGrid: {
    flex: 1,
    flexDirection: "column",
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  optionsContainer: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    zIndex: 2,
  },
  optionButton: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 100 / 2,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: "center"
  },
  spacing: {
    padding: 10
  },
  inputLabel: {
    fontSize: 18
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: '90%',
    borderRadius: 30,
  },
  loginButton: {
    backgroundColor: "#1E3378",
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 10
  },
  Buttontext: {
    color: 'white',
    fontWeight: '500',
    fontSize: 18
  },
  inputBox: {
    borderBottomColor: '#cccccc',
    fontSize: 16,
    width: "95%",
    borderBottomWidth:1
  },
});