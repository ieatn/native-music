import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import {
  AntDesign,
  Entypo,
  FontAwesome,
  Ionicons,
  Feather,
} from "@expo/vector-icons";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import { Audio } from "expo-av";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "@env";

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET, // Add your client secret if required
  redirectUri: "exp://127.0.0.1:19000/",
});

const LikedSongsScreen = () => {
  const [token, setToken] = useState("");
  const [albumImage, setAlbumImage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState();
  const [progress, setProgress] = useState(0); // Progress in seconds
  const duration = 30; // Duration of the song in seconds
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const [currentSong, setCurrentSong] = useState(null);
  const [previousSong, setPreviousSong] = useState(null);

  const [trackInfo, setTrackInfo] = useState({
    name: "Track Name",
    author: "Author Name",
  });
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: SPOTIFY_CLIENT_ID,
      scopes: [
        "user-read-currently-playing",
        "user-read-recently-played",
        "user-read-playback-state",
        "user-top-read",
        "user-modify-playback-state",
        "streaming",
        "user-read-email",
        "user-read-private",
      ],
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: "exp://127.0.0.1:19000/",
    },
    discovery
  );

  const handleAuth = async () => {
    const result = await promptAsync();
    console.log("Authentication result:", result);
  };

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
      spotifyApi.setAccessToken(access_token);
      console.log("Token obtained:", access_token);
    } else if (response?.type === "error") {
      console.log("Authorization failed:", response.error, response.params);
    } else {
      console.log("Unexpected response:", response);
    }
  }, [response]);

  // Get a list of the user's playlists
  const getUserPlaylists = async () => {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/playlists",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.items;
    } catch (error) {
      console.error("Error fetching playlists:", error.response.data);
      throw error;
    }
  };

  const updateTrackInfo = (name, author) => {
    setTrackInfo({
      name,
      author,
    });
  };

  // Get a random element from an array
  const getRandomElement = (array) => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  };

  const play = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const playPauseToggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // const playRandomSong = async () => {
  //   try {
  //     // Stop and unload the previous song (if it exists)
  //     if (sound) {
  //       sound.stopAsync();
  //       sound.unloadAsync();
  //     }

  //     let playableTracks = [];

  //     // Get user playlists
  //     const playlists = await getUserPlaylists();

  //     // Iterate through playlists to find playable tracks
  //     for (const playlist of playlists) {
  //       const playlistId = playlist.id;
  //       const response = await axios.get(
  //         `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       // Filter tracks with preview URL
  //       const tracksWithPreview = response.data.items.filter(
  //         (track) => track.track.preview_url
  //       );

  //       // Add playable tracks to the list
  //       playableTracks = playableTracks.concat(tracksWithPreview);
  //     }

  //     if (playableTracks.length === 0) {
  //       console.log("No playable tracks found in user playlists.");
  //       return;
  //     }

  //     // Get a random playable track
  //     const randomPlayableTrack = getRandomElement(playableTracks);

  //     // Log details of the selected track
  //     // console.log('Random Track Title:', randomPlayableTrack.track.name);
  //     // console.log('Random Author Title:', randomPlayableTrack.track.artists[0].name);
  //     // console.log('Preview URL:', randomPlayableTrack.track.preview_url);

  //     // Update the UI with track information
  //     updateTrackInfo(
  //       randomPlayableTrack.track.name,
  //       randomPlayableTrack.track.artists[0].name
  //     );
  //     // Save the current song as the previous song
  //     setPreviousSong(currentSong);
  //     // Save the new song as the current song
  //     setCurrentSong(randomPlayableTrack.track);
  //     // Update the album image
  //     setAlbumImage(randomPlayableTrack.track.album.images[0].url);

  //     // Play the selected track
  //     const { sound: newSound } = await Audio.Sound.createAsync(
  //       { uri: randomPlayableTrack.track.preview_url },
  //       { shouldPlay: true }
  //     );

  //     // Set the current sound
  //     setSound(newSound);
  //     setIsPlaying(true);

  //     // Reset progress to 0 for the new song
  //     setProgress(0);

  //     // Wait for the track to finish playing
  //     newSound.setOnPlaybackStatusUpdate((status) => {
  //       if (status.didJustFinish) {
  //         newSound.unloadAsync();
  //         setIsPlaying(false);
  //         // Clear track information when the song finishes
  //         updateTrackInfo("Track Name", "Author Name");
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error playing random song:", error);
  //   }
  // };


  const playRandomSong = async () => {
    try {
      // Stop and unload the previous song (if it exists)
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
  
      let playableTracks = [];
  
      // Get user playlists
      const playlists = await getUserPlaylists();
  
      const drivingPlaylist = playlists.find((playlist) => playlist.name.toLowerCase() === 'driving (2)');
  
      if (drivingPlaylist) {
        // If the "driving (2)" playlist is found, proceed to get its tracks
        const playlistId = drivingPlaylist.id;
        const response = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        // Process the tracks of the "driving (2)" playlist
        const tracksWithPreview = response.data.items.filter(
          (track) => track.track.preview_url
        );
  
        // Add playable tracks to the list
        playableTracks = tracksWithPreview;
      } else {
        console.log("No 'driving (2)' playlist found.");
  
        // Iterate through playlists to find playable tracks
        for (const playlist of playlists) {
          const playlistId = playlist.id;
          const response = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          // Filter tracks with preview URL
          const tracksWithPreview = response.data.items.filter(
            (track) => track.track.preview_url
          );
  
          // Add playable tracks to the list
          playableTracks = playableTracks.concat(tracksWithPreview);
        }
      }
  
      if (playableTracks.length === 0) {
        console.log("No playable tracks found in user playlists.");
        return;
      }
  
      // Get a random playable track
      const randomPlayableTrack = getRandomElement(playableTracks);
  
      // Update the UI with track information
      updateTrackInfo(
        randomPlayableTrack.track.name,
        randomPlayableTrack.track.artists[0].name
      );
  
      // Save the current song as the previous song
      setPreviousSong(currentSong);
  
      // Save the new song as the current song
      setCurrentSong(randomPlayableTrack.track);
  
      // Update the album image
      setAlbumImage(randomPlayableTrack.track.album.images[0].url);
  
      // Play the selected track
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: randomPlayableTrack.track.preview_url },
        { shouldPlay: true }
      );
  
      // Set the current sound
      setSound(newSound);
      setIsPlaying(true);
  
      // Reset progress to 0 for the new song
      setProgress(0);
  
      // Wait for the track to finish playing
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          newSound.unloadAsync();
          setIsPlaying(false);
          // Clear track information when the song finishes
          updateTrackInfo("Track Name", "Author Name");
        }
      });
    } catch (error) {
      console.error("Error playing random song:", error);
    }
  };
  

  const playPreviousSong = async () => {
    if (previousSong) {
      try {
        if (sound) {
          sound.stopAsync();
          sound.unloadAsync();
        }

        // Update the UI with previous track information
        updateTrackInfo(previousSong.name, previousSong.artists[0].name);
        setAlbumImage(previousSong.album.images[0].url);

        // Play the previous track
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: previousSong.preview_url },
          { shouldPlay: true, position: 0 } // Start from the beginning
        );

        // Set the current sound
        setSound(newSound);
        setIsPlaying(true);
        setProgress(0); // Reset progress for the previous song

        // Wait for the track to finish playing
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            newSound.unloadAsync();
            setIsPlaying(false);
            // Clear track information when the song finishes
            updateTrackInfo("Track Name", "Author Name");
          }
        });
      } catch (error) {
        console.error("Error playing previous song:", error);
      }
    }
  };

  useEffect(() => {
    let interval;

    if (isPlaying && progress < duration) {
      // Update progress every second if playing
      interval = setInterval(() => {
        setProgress((prevProgress) =>
          prevProgress < duration ? prevProgress + 1 : duration
        );
      }, 1000);
    }

    // Clear interval on component unmount or if paused
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    // Update animatedWidth based on progress changes
    Animated.timing(animatedWidth, {
      toValue: progress / duration, // Normalize progress to a value between 0 and 1
      duration: 1000, // Duration of the animation in milliseconds
      easing: Easing.linear,
      useNativeDriver: false, // Add this line for Android support
    }).start();
  }, [progress, animatedWidth]);

  return (
    <>
      <ScrollView
        style={{ width: "100%", height: "100%", backgroundColor: "#5072A7" }}
      >
        <View style={{ width: "100%", height: "100%", marginTop: 40 }}>
          <Pressable onPress={handleAuth}>
            <Text>Authenticate</Text>
          </Pressable>
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <AntDesign name="down" size={24} color="white" />
            <Text style={{ fontSize: 14, fontWeight: "bold", color: "white" }}>
              {trackInfo.name}
            </Text>
            <Entypo name="dots-three-vertical" size={24} color="white" />
          </Pressable>
          <View style={{ height: 70 }} />

          <View style={{ padding: 10 }}>
            {/* album image */}
            <Image
              style={{ width: "100%", height: 330, borderRadius: 4 }}
              source={{ uri: albumImage }}
            />
            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "white" }}
                >
                  {trackInfo.name}
                </Text>
                <Text style={{ color: "#D3D3D3", marginTop: 4 }}>
                  {trackInfo.author}
                </Text>
              </View>

              <AntDesign name="heart" size={24} color="#1DB954" />
            </View>

            <View style={{ marginTop: 10 }}>
              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text>{formatTime(progress)}</Text>

                {/* Progress Bar */}
                <View
                  style={{
                    flex: 1,
                    height: 10,
                    backgroundColor: "#ccc", // Background color of the progress bar
                    marginHorizontal: 8,
                  }}
                >
                  {/* Animated progress bar */}
                  <Animated.View
                    style={{
                      height: "100%",
                      width: animatedWidth.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor: "blue", // Color of the progress bar
                    }}
                  />
                </View>

                <Text>{formatTime(duration)}</Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 17,
              }}
            >
              <Pressable>
                <FontAwesome name="arrows" size={30} color="#03C03C" />
              </Pressable>
              <Pressable onPress={playPreviousSong}>
                <Ionicons name="play-skip-back" size={30} color="white" />
              </Pressable>
              <Pressable onPress={() => playPauseToggle()}>
                {isPlaying ? (
                  <Ionicons name="pause-circle" size={60} color="white" />
                ) : (
                  <Entypo name="controller-play" size={60} color="white" />
                )}
              </Pressable>
              <Pressable onPress={playRandomSong}>
                <Ionicons name="play-skip-forward" size={30} color="white" />
              </Pressable>
              <Pressable>
                <Feather name="repeat" size={30} color="#03C03C" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default LikedSongsScreen;

const styles = StyleSheet.create({});
