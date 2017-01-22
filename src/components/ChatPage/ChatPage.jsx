
import React from 'react';
import MessageForm from './MessageForm'
import MessageList from './MessageList'
import TitleBar from './TitleBar'
import classNames from 'classnames/bind';
import styles from './styles/ChatPage.css';
import io from 'socket.io-client';

let cx = classNames.bind(styles);
let path = 'http://' + window.location.hostname;
if (window.location.hostname == "localhost") {
    path += ":" + window.location.port;
}
let socket = io(path);

class ChatPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            messages: [],
            text: ''
        };

        this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);

        this._initialize = this._initialize.bind(this);
        this._messageRecieve = this._messageRecieve.bind(this);
        this._userJoined = this._userJoined.bind(this);
        this._userLeft = this._userLeft.bind(this);
        this._userChangedName = this._userChangedName.bind(this);
    }

    componentDidMount() {
        socket.on('init', this._initialize);
        socket.on('send:message', this._messageRecieve);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);

        socket.emit('init');
    }

    handleMessageSubmit(message) {
        var {messages} = this.state;
        messages.push(message);
        this.setState({messages});
        socket.emit('send:message', message);
    }

    handleUsernameChange(userName){
        alert('Username Changed');
    }

    _initialize(data) {
        console.log(data);
        var {users, messages, name} = data;
        this.setState({users, messages, user: name});
    }

    _messageRecieve(message) {
        var {messages} = this.state;
        messages.push(message);
        this.setState({messages});
    }

    _userJoined(data) {
        var {messages} = this.state;
        var {users, name} = data;
        messages.push({
            user: 'APPLICATION BOT',
            text: name +' Joined',
            timestamp: Date.now()
        });
        this.setState({users, messages});
    }

    _userLeft(data) {
        var {messages} = this.state;
        var {users, name} = data;
        messages.push({
            user: 'APPLICATION BOT',
            text: name +' Left',
            timestamp: Date.now()
        });
        this.setState({users, messages});
    }

    _userChangedName(data) {
        var {messages} = this.state;
        var {oldName, newName} = data;

        // Update User List with new name
        var index = users.indexOf(oldName);
        users.splice(index, 1);
        users.push(newName);

        // Update all corresponding messages with newName
        var messagesLength = this.state.messages.length;
        for(var i = 0; i < messagesLength; i++){
            if (messages[0].user == oldName) {
                messages[0].user = newName;
            }
        }

        // Let rest of user know
        messages.push({
            user: 'APPLICATION BOT',
            text: oldName + " changed name to " + newName,
            timestamp: Date.now()
        })

        this.setState({users, messages});

    }

    render() {
        document.body.style.backgroundColor = "#10C0FF";

        return (
            <div className={cx('chatWindow')}>
                <TitleBar userCount={this.state.users.length}/>
                <MessageList messages={this.state.messages}/>
                <MessageForm
                    onMessageSubmit={this.handleMessageSubmit}
                    onUsernameChange={this.handleUsernameChange}
                    user={this.state.user}
                />
            </div>
        )
    }
}

export default ChatPage;
