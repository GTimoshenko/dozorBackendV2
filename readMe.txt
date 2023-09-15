AUTHORIZATION : {
    ////

    http://localhost:5000/auth/register - регистрация пользователя (post)
    {
	"name" : "glebushnik",
	"password" : "glebushnik",
	"eMail" : "glebushnik@gmail.com"
	}
    токен не требуется

    ////

    http://localhost:5000/auth/login -  авторизация пользователя (post)
    {
        "name": "user", 
        "password": "12345" 
    }
    токен не требуется

    ////

    http://localhost:5000/auth/users - получить данные о всех пользователях (get)
    токен требуется! (роль админа)

    ////

    http://localhost:5000/auth/user/:userId- получить данные об одном пользователе через его id (get)
    токен не требуется

	////

	http://localhost:5000/auth/:userId/resetpassword - запросить код для восстановления пароля (post)
	{
		"eMail" : "test@gmail.com"
	}

	////

	http://localhost:5000/auth/:userId/newpassword - установить новый пароль (post)
	{
		"verificationCode" : "s6gp8h", 
		"password1" : "asdasd",
		"password2" : "asdasd"
	}

}


EVENTS : {
    ////
    http://localhost:5000/events/:hostId- создать событие, требуется id хооста (post)
    {
        "name": "dozor", (имя не должно быть пустым)
        "description": "oogabooga",
		"questions": "dsadsadsa, dsadsadsa"
    }
    токен требуется! (роль админа, vip)

    ////

    http://localhost:5000/events/delete/:eventId - удалить событие требуется id хоста и id события (post)
	{
	"hostId" : "65048386200b40b2d9f5f9a8"
	}
	токен требуется! (роль админа, vip)


    ////

    http://localhost:5000/events/addteam/:eventId - добавить команду в событие, требуется id хоста и id команды (post)
    {
	"hostId" : "65048386200b40b2d9f5f9a8",
	"teamId" : "64dca4e3a47557674b53b4c1"
	}
	токен требуется! (роль админа, vip)

    ////

    http://localhost:5000/events//kickteam/:eventId - удалить команду из события, требуется id хоста и id команды (post)
    {
	"hostId" : "65048386200b40b2d9f5f9a8",
	"teamId" : "64dca4e3a47557674b53b4c1"
	}
	токен требуется! (роль админа, vip)

    ////
    
    http://localhost:5000/events/all -получить данные о всех событиях (get)
    токен требуется! (admin, vip, user)

    ////

    http://localhost:5000/events/eventmembers/:eventId () (get) получить данные об участниках события через его id (get)
    токен не требуется
    
    ////

    http://localhost:5000/events/event/:eventId - получить данные об одном событии через id (get)
    токен не требуется

	////

	http://localhost:5000/events/eventhost/:eventId - получить данные об организаторе события через id (get)
	токен не требуется
}

TEAMS : {
    ////

    http://localhost:5000/teams/new/:capId - зарегистрировать команду, требуется id капитана (post)
    {
        "teamName": "dozor", (имя не должно быть пустым)
        "password": "54321" (пароль должен быть от 4 до 12 символов)
    }
    токен требуется! (admin, vip, user)

    ////
    
    http://localhost:5000/teams/invite/:memberId - пригласить пользователя в команду, требуется id пользователя (post)
     {
        "teamName": "dozor", (имя не должно быть пустым)
        "password": "54321" (пароль должен быть от 4 до 12 символов)
    }
    токен не требуется
    ////
    
    http://localhost:5000/teams/delete/:teamId - удалить команду, требуется id капитана и команды (post)
    {
	"capId" : "64c59eb68e28bb0fbc1142ea"
	}
	токен не требуется

    ////

    http://localhost:5000/teams/:capId/kick/:memberId' - выгнать члена команды, требуется id капитана, команды и члена команды, которого требуется выгнать  (post)
    {
	"capId" : "64c59eb68e28bb0fbc1142ea",
	"teamId" : "65049fce3b1a64d0feaa6729"
	}
	токен не требуется

    ////

    http://localhost:5000/teams/all - получить данные о всех командах (get)
    токен не требуется

    ////

    http://localhost:5000/teams/team/:teamId - получить данные об одной команде (get)
    токен не требуется

    ////

    http://localhost:5000/teams/teamcap/:teamId - получить данные о капитане команды (get)
    токен не требуется

    ////

    http://localhost:5000/teams/teammembers/:teamId - получить данные об участниках команды (get)
    токен не требуется

    ////
}

CHATS : {
    ////

    http://localhost:5000/chat/ - создать чат (post)
    {
        "firstId": "64dace78c40e0cb3c2cb5d50",
        "secondId": "64dace78c40e0cb3c2cb5d50"
    }
    токен не требуется

    ////

    http://localhost:5000/chat/:userId - получить данные о чатах, в которых состоит пользователь, требуется id пользователя (get)
    токен не требуется

    ////

    http://localhost:5000/chat/find/:firstId/:secondId - получить данные о чате по двум id пользователей (get)
    токен не требуется

    ////
}
MESSAGES : {
    ////

     http://localhost:5000/message/ - создать сообщение (post)
     {
        "chatId": "64db4981fb756fc913956405",
        "senderId": "64dace78c40e0cb3c2cb5d50",
        "text": "preved"
     }
    токен не требуется

    ////

    http://localhost:5000/message/:chatId - получить все сообщения из чата, требуется id чата (get)
    токен не требуется

    ////
}