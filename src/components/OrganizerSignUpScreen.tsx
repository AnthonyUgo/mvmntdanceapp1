import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { ThemeContext } from '../contexts/ThemedContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'OrganizerSignUp'>;

const accent = '#a259ff';

const OrganizerSignUpScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<NavProp>();

  // Core fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // DOB picker
  const [dob, setDob] = useState<string>('');
  const [showDobPicker, setShowDobPicker] = useState(false);

  // Gender picker
  const [gender, setGender] = useState<string>('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Account type toggle
  const [accountType, setAccountType] = useState<'user'|'organizer'>('user');

  // Organizer extras
  const [phone, setPhone] = useState('');
  const [street, setStreet]     = useState('');
  const [unit, setUnit]         = useState('');
  const [city, setCity]         = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zip, setZip]           = useState('');

  // Terms
  const [accepted, setAccepted] = useState(false);

  // Validation markers
  const hasUpper = /[A-Z]/.test(password);
  const hasNum   = /\d/.test(password);
  const hasSpec  = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasLen   = password.length >= 9;

  const onDobChange = (_: any, date?: Date) => {
    setShowDobPicker(false);
    if (date) {
      const s = date.toISOString().split('T')[0];
      setDob(s);
      if (s === new Date().toISOString().split('T')[0]) {
        Alert.alert('🎉 Happy Birthday!', 'We noticed it’s your birthday today!');
      }
    }
  };

  const handleSignUp = async () => {
    // basic fields
    if (!firstName || !lastName || !username || !email || !password || !dob || !gender) {
      return Alert.alert('Missing fields', 'Please complete all required fields.');
    }
    if (accountType==='organizer') {
      if (!phone||!street||!city||!stateCode||!zip) {
        return Alert.alert('Organizer info', 'Phone and full address are required.');
      }
    }
    if (!accepted) {
      return Alert.alert('Terms', 'You must accept the Terms of Service.');
    }

    const payload: any = {
      firstName, lastName, username, email, password, dob, gender,
      accountType, phone,
      ...(accountType==='organizer' && {
        address: { street, unit, city, state: stateCode, zip }
      })
    };

    try {
      const res = await fetch(
        'https://muvs-backend-abc-e5hse4csf6dhajfy.canadacentral-01.azurewebsites.net/api/auth/signup',
        { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) }
      );
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Verify your email', 'A link was sent — you can log in but cannot create events until verified.');
        navigation.navigate('OrganizerLogin');
      } else {
        Alert.alert('Sign Up Failed', data.error || 'Unexpected error');
      }
    } catch(err) {
      console.error(err);
      Alert.alert('Server error', 'Please try again later.');
    }
  };

  const styles = StyleSheet.create({
    container: { flex:1, backgroundColor: theme==='dark'?'#121212':'#f9f9f9' },
    scroll:    { padding:20, flexGrow:1, justifyContent:'center' },
    card:      { backgroundColor: theme==='dark'?'#1e1e1e':'#fff', borderRadius:16, padding:20, shadowColor:'#000', shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:8,elevation:5 },
    title:     { fontSize:24,fontWeight:'bold',color:accent,textAlign:'center',marginBottom:20 },
    input:     { borderBottomWidth:1,borderBottomColor:'#555',paddingVertical:8,marginBottom:16,color:theme==='dark'?'#fff':'#000' },
    row:       { flexDirection:'row',alignItems:'center',marginBottom:16 },
    radioBtn:  { width:20,height:20,borderRadius:10,borderWidth:2,marginRight:8,justifyContent:'center',alignItems:'center' },
    radioDot:  { width:10,height:10,borderRadius:5,backgroundColor:accent },
    flexRow:   { flexDirection:'row',justifyContent:'space-between' },
    half:      { width:'48%' },
    button:    { backgroundColor:accent,padding:14, borderRadius:8,alignItems:'center',marginTop:10 },
    btnText:   { color:'#fff',fontSize:16 },
    linkText:  { color:accent,textAlign:'right',marginVertical:8 },
    smallText: { fontSize:12,color:'#888',marginBottom:8 },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS==='ios'?'padding':undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up Here</Text>

          {/* Name, Username, Email */}
          <TextInput
            placeholder="First Name" style={styles.input}
            value={firstName} onChangeText={setFirstName}
          />
          <TextInput
            placeholder="Last Name" style={styles.input}
            value={lastName} onChangeText={setLastName}
          />
          <TextInput
            placeholder="Username" style={styles.input}
            value={username} onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Email" style={styles.input}
            value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
          />

          {/* Password */}
          <View style={[styles.row, { borderBottomColor:'#555', borderBottomWidth:1, marginBottom:16 }]}>
            <TextInput
              placeholder="Password"
              style={{ flex:1, color: theme==='dark'?'#fff':'#000' }}
              value={password} onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={()=>setShowPassword(v=>!v)}>
              <Ionicons name={showPassword?'eye-off':'eye'} size={20} color={theme==='dark'?'#fff':'#000'} />
            </TouchableOpacity>
          </View>
          {/* Password rules */}
          <View style={{ marginBottom:16 }}>
            <Text style={[styles.smallText,{color:hasUpper?'#0f0':'#f55'}]}>• Uppercase letter</Text>
            <Text style={[styles.smallText,{color:hasNum?'#0f0':'#f55'}]}>• Number</Text>
            <Text style={[styles.smallText,{color:hasSpec?'#0f0':'#f55'}]}>• Special character</Text>
            <Text style={[styles.smallText,{color:hasLen?'#0f0':'#f55'}]}>• ≥ 9 characters</Text>
          </View>

          {/* DOB */}
          <TouchableOpacity
            onPress={()=>setShowDobPicker(true)}
            style={[styles.input,{ justifyContent:'center' }]}
          >
            <Text style={{ color: dob? (theme==='dark'?'#fff':'#000') : '#888' }}>
              {dob || 'Date of Birth'}
            </Text>
          </TouchableOpacity>
          {showDobPicker && (
            <DateTimePicker
              value={dob?new Date(dob+'T00:00:00'):new Date(2000,0,1)}
              mode="date"
              display={Platform.OS==='ios'?'spinner':'default'}
              maximumDate={new Date()}
              onChange={onDobChange}
            />
          )}

          {/* Gender */}
          { !gender || showGenderPicker ? (
            <Picker
              selectedValue={gender}
              style={{ marginBottom:16, color: theme==='dark'?'#fff':'#000' }}
              onValueChange={(v)=>{ setGender(v); setShowGenderPicker(false); }}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male"   value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other"  value="other" />
            </Picker>
          ) : (
            <TouchableOpacity onPress={()=>setShowGenderPicker(true)} style={[styles.input,{ justifyContent:'center' }]}>
              <Text style={{ color: theme==='dark'?'#fff':'#000' }}>{gender}</Text>
            </TouchableOpacity>
          )}

          {/* Account type radio */}
          <View style={[styles.row, { marginBottom:16 }]}>
            {(['user','organizer'] as const).map(type => (
              <View key={type} style={[styles.row, { marginRight:24 }]}>
                <TouchableOpacity
                  style={[styles.radioBtn, { borderColor: accountType===type?accent:'#888' }]}
                  onPress={()=>setAccountType(type)}
                >
                  {accountType===type && <View style={styles.radioDot}/> }
                </TouchableOpacity>
                <Text style={{ color: theme==='dark'?'#fff':'#000' }}>{type.charAt(0).toUpperCase()+type.slice(1)}</Text>
              </View>
            ))}
          </View>

          {/* Organizer-only */}
          {accountType==='organizer' && <>
            <TextInput
              placeholder="Phone Number"
              style={styles.input}
              value={phone} onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Text style={styles.smallText}>Street Address</Text>
            <TextInput
              placeholder="123 Main St"
              style={styles.input}
              value={street} onChangeText={setStreet}
            />
            <View style={styles.flexRow}>
              <View style={styles.half}>
                <Text style={styles.smallText}>Apt/Unit #</Text>
                <TextInput
                  placeholder="Unit #"
                  style={styles.input}
                  value={unit} onChangeText={setUnit}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.smallText}>City</Text>
                <TextInput
                  placeholder="City"
                  style={styles.input}
                  value={city} onChangeText={setCity}
                />
              </View>
            </View>
            <View style={styles.flexRow}>
              <View style={styles.half}>
                <Text style={styles.smallText}>State</Text>
                <TextInput
                  placeholder="State"
                  style={styles.input}
                  value={stateCode} onChangeText={setStateCode}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.smallText}>ZIP Code</Text>
                <TextInput
                  placeholder="ZIP"
                  style={styles.input}
                  value={zip} onChangeText={setZip}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </>}

          {/* Terms */}
          <View style={[styles.row,{ marginVertical:16 }]}>
            <Switch
              value={accepted}
              onValueChange={setAccepted}
              trackColor={{ false:'#555', true:accent }}
              thumbColor={accepted?'#fff':'#ccc'}
            />
            <Text style={{ marginLeft:8, color: theme==='dark'?'#fff':'#000' }}>
              Accept Terms of Service
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, { opacity: accepted?1:0.6 }]}
            onPress={handleSignUp}
            disabled={!accepted}
          >
            <Text style={styles.btnText}>Create Account</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OrganizerSignUpScreen;
