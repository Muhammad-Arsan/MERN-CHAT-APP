/** @format */

import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const toast = useToast();

  const { user, selectedChat, setSelectedChat } = ChatState();
  console.log("selectedChat", user.token);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
    } catch (error) {}
  };
  console.log("MESAGE", messages);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      try {
        console.log("CLEIKC");

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          `/api/message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        // setMessages([...messages, data.message]);

        setMessages([...messages, data]);
      } catch (error) {
        console.log("Error", error);

        toast({
          title: "Failed to Create the Chat!",
          description: error.response.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // typing indicatior logic
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  return (
    <div>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w='100%'
            fontFamily='Work sans'
            d='flex'
            justifyContent={{ base: "space-between" }}
            alignItems='center'
          >
            <IconButton
              d={{ base: "flex", md: "" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
            <Box
              display='flex'
              flexDir='column'
              justifyContent='flex-end'
              p={3}
              bg='#E8E8E8'
              w='100%'
              h='80vh'
              borderRadius='lg'
              overflowY='hidden'
            >
              {loading ? (
                <Spinner
                  size='xl'
                  w={20}
                  h={20}
                  alignSelf='center'
                  margin='auto'
                />
              ) : (
                <div className='messages'>
                  <ScrollableChat messages={messages} />
                </div>
              )}
              <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                <Input
                  variant='filled'
                  bg='#E0E0E0'
                  placeholder='Enter a message...'
                  onChange={typingHandler}
                  value={newMessage}
                />
              </FormControl>
            </Box>
          </Text>
        </>
      ) : (
        <Box d='flex' alignItems='center' justifyContent='center' h='100%'>
          <Text fontSize='3xl' pb={3} fontFamily='Work sans'>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </div>
  );
};

export default SingleChat;
