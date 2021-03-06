import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  ImageBackground,
  SectionList,
  ScrollView,
} from 'react-native';
import {IMAGE_URL} from '../constant/general';
import CardMovie from './common/CardMovie';
import CardGenre from './common/CardGenre';
import AntDesign from 'react-native-vector-icons/AntDesign';
// action
import {
  getPopularAction,
  getGenresAction,
  getUpcomingAction,
  getNowPlayingAction,
  getTopRatedAction,
} from '../actions/movieAction';
import {getUserAction} from '../actions/userAction';
import SectionMovie from './common/SectionMovie';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {color} from '../styles/default';

const Home = props => {
  const dispatch = useDispatch();
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);
  const loading = useSelector(state => state.movies.loading);
  const genres = useSelector(state => state.movies.genres);
  const profile = useSelector(state => state.user.profile);
  const auth = useSelector(state => state.user.auth);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchTextInput, setSearchTextInput] = useState(null);
  const movies = [
    {
      title: 'Upcoming',
      data: useSelector(state => state.movies.upcoming),
    },
    {
      title: 'Popular',
      data: useSelector(state => state.movies.popular),
    },
    {
      title: 'Now Playing',
      data: useSelector(state => state.movies.nowPlaying),
    },
    {
      title: 'Top Rated',
      data: useSelector(state => state.movies.topRated),
    },
  ];
  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem('token');
      if (value !== null) {
        return value;
      }
    } catch (error) {
      // Error retrieving data
    }
  };
  useEffect(() => {
    dispatch(getPopularAction());
    dispatch(getUpcomingAction());
    dispatch(getNowPlayingAction());
    dispatch(getTopRatedAction());
    dispatch(getGenresAction());
    // dispatch(getUserAction(auth.id));
    // if (!getToken()) {
    //   props.navigation.navigate('Login');
    // } else {
    //   dispatch(getPopularAction());
    //   dispatch(getUpcomingAction());
    //   dispatch(getNowPlayingAction());
    //   dispatch(getTopRatedAction());
    //   dispatch(getGenresAction());
    //   dispatch(getUserAction(auth.id));
    // }
  }, []);

  const handleSelectGenre = id => {
    let updateSelectedGenres = selectedGenres;
    let idx = selectedGenres.findIndex(genre => genre == id);
    if (idx == -1) {
      updateSelectedGenres.push(id);
    } else {
      updateSelectedGenres.splice(idx, 1);
    }
    setSelectedGenres(updateSelectedGenres);
    setIsRefresh(!isRefresh);
  };

  const searchByGenres = movies => {
    let filteredMovies = movies.filter(movie => {
      let isSelected = true;
      for (let i = 0; i < selectedGenres.length; i++) {
        let idx = movie?.genre_ids?.findIndex(idx => idx == selectedGenres[i]);
        if (idx == -1) {
          isSelected = false;
          break;
        }
      }
      if (isSelected) {
        return movie;
      }
    });
    return filteredMovies;
  };

  const searchByTextInput = movies => {
    let filteredMovies = movies.filter(movie =>
      movie.title.toLowerCase().includes(searchTextInput.toLowerCase()),
    );
    return filteredMovies;
  };

  const handleFilterMovie = movies => {
    let filteredMovies;
    if (selectedGenres.length > 0 && !searchTextInput) {
      filteredMovies = searchByGenres(movies);
    }
    if (searchTextInput && selectedGenres.length == 0) {
      filteredMovies = searchByTextInput(movies);
    }
    if (searchTextInput && selectedGenres.length > 0) {
      filteredMovies = searchByTextInput(searchByGenres(movies));
    }

    return filteredMovies;
  };

  const renderMoviePerSection = ({item}) => (
    <SectionMovie
      title={item.title}
      data={
        searchTextInput || selectedGenres.length > 0
          ? handleFilterMovie(item.data)
          : item.data
      }
      genres={genres}
      navigation={props.navigation}
    />
  );
  const renderMapPerSection = movies.map((movie, i) => (
    <SectionMovie
      key={i}
      title={movie.title}
      data={
        searchTextInput || selectedGenres.length > 0
          ? handleFilterMovie(movie.data)
          : movie.data
      }
      genres={genres}
      navigation={props.navigation}
    />
  ));
  return (
    <ScrollView style={styles.container}>
      {!loading ? (
        <View style={{width: '100%'}}>
          <View style={{width: '100%'}}>
            <TextInput
              placeholder="Search movie..."
              placeholderTextColor={color.white}
              style={{
                height: 45,
                backgroundColor: color.darkGrey,
                color: color.white,
                borderRadius: 10,
                paddingHorizontal: 35,
              }}
              value={searchTextInput}
              onChangeText={text => setSearchTextInput(text)}
            />
            <AntDesign
              name="search1"
              size={25}
              color={color.red}
              style={{position: 'absolute', top: 10, left: 5}}
            />
          </View>
          <CardGenre genres={genres} handleSelectGenre={handleSelectGenre} />
          <View
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              marginBottom: 100,
              // paddingBottom: 50,
              // flex: 1,
            }}>
            {renderMapPerSection}
          </View>
        </View>
      ) : (
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <ActivityIndicator size="large" color={color.darkRed} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: color.black,
  },
  topContainer: {
    flex: 4,
    width: '100%',
  },
  bottomContainer: {
    flex: 6,
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: 'white',
    width: '100%',
    flexDirection: 'row',
  },
  box: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'orange',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  boxText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  poster: {
    width: 150,
    height: 225,
    marginVertical: 5,
    marginRight: 10,
    borderRadius: 5,
    resizeMode: 'cover',
  },
});

export default Home;
