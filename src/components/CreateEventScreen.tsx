// CreateEventScreen.tsx
import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const CreateEventScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const bg = theme === 'dark' ? '#121212' : '#fff';
  const txt = theme === 'dark' ? '#fff' : '#000';
  const accent = '#4285F4';

  // Core state
  const [imageUri, setImageUri] = useState<string|null>(null);
  const [eventName, setEventName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [unit, setUnit] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zip, setZip] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [start, setStart] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [end, setEnd] = useState(new Date());
  const [showEnd, setShowEnd] = useState(false);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [collab, setCollab] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // pick image
  const pickImage = async () => {
    const res = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7
    });
    if (!res.canceled && res.assets.length) {
      setImageUri(res.assets[0].uri);
    }
  };

  // Save
  const handleSave = async (draft: boolean) => {
    if (!eventName || !venueName || !street || !city || !stateCode || !zip) {
      return Alert.alert('Missing Fields','Please complete all required fields.');
    }
    const organizerId = await AsyncStorage.getItem('organizerUsername');
    if (!organizerId) {
      return Alert.alert('Not signed in','Please log in as an organizer.');
    }

    const payload = {
      id: Date.now().toString(),
      title: eventName,
      date: date.toISOString().slice(0,10),
      startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime:   end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      venueName,
      venueAddress: `${street}${unit?`, Apt ${unit}`:''}, ${city}, ${stateCode} ${zip}`,
      venueCity: city,
      venueState: stateCode,
      venueZip: zip,
      price,
      quantity,
      collaborator: collab,
      image: imageUri,
      draft,
      visibility: isPrivate ? 'private':'public',
      shareCode: isPrivate ? Math.random().toString(36).substr(2,8):null,
      tickets: [],
      organizerId
    };

    try {
      const res = await fetch(
        'https://your-ngrok-url/api/events',
        {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error||res.statusText);
      }
      Alert.alert('Success', draft?'Saved as draft':'Published!');
      nav.navigate('MyEvents',{ initialTab: draft?'drafts':'live' });
    } catch(e:any) {
      console.warn(e);
      Alert.alert('Error', e.message);
    }
  };

  // Extract address components helper
  const extract = (components:any[], type:string) =>
    components.find(c=>c.types.includes(type))?.long_name||'';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS==='ios'?'padding':undefined}
      style={{flex:1,backgroundColor:bg}}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={[s.header,{color:txt}]}>Create Event</Text>

        {/* Image */}
        <TouchableOpacity onPress={pickImage} style={s.imagePicker}>
          {imageUri
            ? <Image source={{uri:imageUri}} style={s.image} />
            : <View style={s.placeholder}>
                <Ionicons name="camera-outline" size={40} color={accent}/>
                <Text style={{color:accent}}>Add Event Image</Text>
              </View>
          }
        </TouchableOpacity>

        {/* Event Name */}
        <TextInput
          style={[s.input,{backgroundColor:theme==='dark'?'#1e1e1e':'#f5f5f5',color:txt}]}
          placeholder="Event Name"
          placeholderTextColor="#888"
          value={eventName}
          onChangeText={setEventName}
        />

        {/* Google Places for Venue */}
        <GooglePlacesAutocomplete
          placeholder="Search venue"
          fetchDetails
          query={{ key: GOOGLE_PLACES_API_KEY, language:'en', types:'establishment' }}
          onPress={(data, details) => {
            setVenueName(data.description);
            const comps = details?.address_components||[];
            setStreet(extract(comps,'street_number')+' '+extract(comps,'route'));
            setCity(extract(comps,'locality'));
            setStateCode(extract(comps,'administrative_area_level_1'));
            setZip(extract(comps,'postal_code'));
          }}
          styles={{
            textInput:{...s.input, paddingLeft:20, paddingRight:50, backgroundColor:theme==='dark'?'#1e1e1e':'#f5f5f5', color:txt},
            container:{flex:0,marginBottom:16},
            listView:{backgroundColor:theme==='dark'?'#333':'#fff'}
          }}
        />

        {/* Address fields */}
        <View style={s.row}>
          <TextInput
            style={[s.input,s.half,{backgroundColor:theme==='dark'?'#1e1e1e':'#f5f5f5',color:txt}]}
            placeholder="Street"
            placeholderTextColor="#888"
            value={street}
            onChangeText={setStreet}
          />
          <TextInput
            style={[s.input,s.half,{backgroundColor:theme==='dark'?'#1e1e1e':'#f5f5f5',color:txt}]}
            placeholder="Apt/Unit (opt.)"
            placeholderTextColor="#888"
            value={unit}
            onChangeText={setUnit}
          />
        </View>
        <View style={s.row}>
          <TextInput
            style={[s.input,s.half,{backgroundColor:theme==='dark'?'#1e1e1e':'#f5f5f5',color:txt}]}
            placeholder="City"
            placeholderTextColor="#888"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={[s.input,s.half,{backgroundColor:theme==='dark'?'#1e1e1e':'#f5f5f5',color:txt}]}
            placeholder="State"
            placeholderTextColor="#888"
            value={stateCode}
            onChangeText={setStateCode}
          />
        </View>
        <TextInput
          style={[s.input,{backgroundColor:theme==='dark'?'#1e1e1e':'#f5f5f5',color:txt}]}
          placeholder="ZIP Code"
          placeholderTextColor="#888"
          value={zip}
          keyboardType="numeric"
          onChangeText={setZip}
        />

        {/* Date & Time */}
        <View style={s.row}>
          <TouchableOpacity
            style={[s.input,s.half,{justifyContent:'center'}]}
            onPress={()=>setShowDate(true)}
          >
            <Text style={{color:txt}}>
              {date.toDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.input,s.half,{justifyContent:'center'}]}
            onPress={()=>setShowStart(true)}
          >
            <Text style={{color:txt}}>
              {start.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
            </Text>
          </TouchableOpacity>
        </View>
        { showDate  && <DateTimePicker
            value={date} mode="date" display="default"
            onChange={(_,d)=>{ setShowDate(false); if(d) setDate(d); }}
          /> }
        { showStart && <DateTimePicker
            value={start} mode="time" display="default"
            onChange={(_,t)=>{ setShowStart(false); if(t) setStart(t); }}
          /> }

        <TouchableOpacity
          style={[s.input,{justifyContent:'center'}]}
          onPress={()=>setShowEnd(true)}
        >
          <Text style={{color:txt}}>
            End: {end.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
          </Text>
        </TouchableOpacity>
        { showEnd && <DateTimePicker
            value={end} mode="time" display="default"
            onChange={(_,t)=>{ setShowEnd(false); if(t) setEnd(t); }}
          /> }

        {/* Price & Qty */}
        <View style={s.row}>
          <TextInput
            style={[s.input,s.half,{backgroundColor:theme==='dark'?'#1e1e1e':'#f5f5f5',color:txt}]}
            placeholder="Price (0.00)"
            placeholderTextColor="#888"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />
          <View style={[s.qtyContainer,{borderColor:accent}]}>
            <Ionicons
              name="remove-circle-outline" size={28} color={accent}
              onPress={()=>quantity>1 && setQuantity(q=>q-1)}
            />
            <Text style={{fontSize:18,color:txt}}>{quantity}</Text>
            <Ionicons
              name="add-circle-outline" size={28} color={accent}
              onPress={()=>setQuantity(q=>q+1)}
            />
          </View>
        </View>

        {/* Collaborator */}
        <TextInput
          style={[s.input,{backgroundColor:theme==='dark'?'#1e1e1e':'#f5f5f5',color:txt}]}
          placeholder="Collaborator username or email"
          placeholderTextColor="#888"
          value={collab}
          onChangeText={setCollab}
        />

        {/* Private toggle */}
        <View style={s.row}>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{false:'#ccc',true:accent}}
            thumbColor="#fff"
          />
          <Text style={{marginLeft:8,color:txt}}>Private event</Text>
        </View>

        {/* Buttons */}
        <View style={s.row}>
          <TouchableOpacity
            style={[s.btnOutline,{borderColor:accent}]}
            onPress={()=>handleSave(true)}
          >
            <Ionicons name="save-outline" size={20} color={accent} />
            <Text style={[s.btnText,{color:accent}]}> Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btnFill,{backgroundColor:accent}]}
            onPress={()=>handleSave(false)}
          >
            <Ionicons name="checkmark-outline" size={20} color="#fff" />
            <Text style={s.btnText}> Publish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container:    { padding:20, paddingBottom:40 },
  header:       { fontSize:24, fontWeight:'bold', marginBottom:20 },
  imagePicker:  {
    height:180, borderWidth:1, borderRadius:12,
    marginBottom:16, overflow:'hidden',
    justifyContent:'center',alignItems:'center'
  },
  image:        { width:'100%',height:'100%' },
  placeholder:  { alignItems:'center' },
  input:        {
    flex:0, width:'100%',
    borderRadius:12, padding:12,
    marginBottom:16, fontSize:16
  },
  row:          { flexDirection:'row',justifyContent:'space-between' },
  half:         { width:'48%' },
  qtyContainer: {
    flexDirection:'row',alignItems:'center',
    justifyContent:'space-between',
    borderWidth:1,borderRadius:12,
    paddingHorizontal:12,paddingVertical:8,
    width:'48%'
  },
  btnFill:      {
    flex:1,flexDirection:'row',alignItems:'center',
    justifyContent:'center',padding:14,
    borderRadius:12,marginLeft:8
  },
  btnOutline:   {
    flex:1,flexDirection:'row',alignItems:'center',
    justifyContent:'center',padding:14,
    borderRadius:12,marginRight:8, borderWidth:1
  },
  btnText:      { color:'#fff',fontSize:16,marginLeft:6 }
});

export default CreateEventScreen;
