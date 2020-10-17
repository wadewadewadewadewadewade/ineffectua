import React, {Suspense} from 'react';
import { SafeAreaView, View, StyleSheet } from "react-native"
import { useSelector } from "react-redux"
import { State } from "../../Types"
import { useQuery, QueryStatus } from "react-query"
import { getUserMessageNames } from "../../middleware/PostsMiddleware"
import { UserName } from "../../reducers/AuthReducer"
import { ActivityIndicator, Text } from "react-native-paper"
import { FlatList, TouchableHighlight } from "react-native-gesture-handler"
import Posts from '../shared/Posts';
import { PostPrivacyTypes } from '../../reducers/PostsReducer';
import { NavigationContainerRef } from '@react-navigation/native';

const MessagesList = ({
  recipientId,
  navigationRef,
} : {
  recipientId: string;
  navigationRef: NavigationContainerRef | null;
}) => {
  return (
    <Posts
      navigationRef={navigationRef}
      showComposePost={true}
      criteria={{key: {id: recipientId, type: 'messages'}, privacy: PostPrivacyTypes.PUBLICANDFRIENDS}}
    />
  )
}

const UserNameComponent = ({
  name,
  onClick,
} : {
  name: UserName,
  onClick: (uid: string) => void,
}) => {
  return (
    <View style={styles.username}>
      <TouchableHighlight
        style={styles.usernameClickable}
        onPress={() => onClick(name.uid)}
      >
        <Text style={styles.usernameText}>{name.displayName ? name.displayName : name.email}</Text>
      </TouchableHighlight>
    </View>
  )
}

const Messages = ({
  onClick
} : {
  onClick: (uid: string) => void;
}) => {
  const user = useSelector((state: State) => state.user)
  const {status, data, error, refetch} = useQuery<Array<UserName>, Error>('messages', () => getUserMessageNames(user), {
    suspense: true,
  });
  if (status === QueryStatus.Loading) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching messages: {error?.message}</Text>;
  } else {
    const users: Array<UserName> = data ? data : [];
    return (
      <SafeAreaView style={styles.flex}>
        <FlatList
          data={users}
          renderItem={(un) =>
            <UserNameComponent
              name={un.item}
              onClick={uid => onClick(uid)}
            />
          }
          keyExtractor={(un, i) => un.uid}
          //onEndReached={fetchMore}
          //refreshing={isFetching}
          onEndReachedThreshold={0.25}
        />
      </SafeAreaView>
    );
  }
}

export const Messaging = ({
  initialUserId,
  navigationRef,
} : {
  initialUserId?: string;
  navigationRef: NavigationContainerRef | null;
}) => {
  const [recipientId, setRecipientId] = React.useState(initialUserId);
  if (recipientId !== undefined) {
    return <MessagesList navigationRef={navigationRef} recipientId={recipientId} />
  } else {
    return <Messages onClick={uid => setRecipientId(uid)} />
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  username: {
    flex: 1,
  },
  usernameClickable: {
    flex: 1,
    padding: 8,
  },
  usernameText: {
    fontSize: 16,
  },
});

export default Messaging;
