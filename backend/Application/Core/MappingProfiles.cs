using Application.Sessions.Commands;
using AutoMapper;
using Domain;
using Dtos.Awards;
using Dtos.Sessions;
using Dtos.Topics;
using Dtos.Users;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<Session, SessionDto>();
        CreateMap<Topic, TopicDto>();
        CreateMap<Award, AwardDto>();
        CreateMap<User, UserDto>();

        CreateMap<UpdateSessionDto, UpdateSession.Command>();
        CreateMap<UpdateSession.Command, Session>();

        CreateMap<CreateSessionDto, CreateSession.Command>();
        CreateMap<CreateSession.Command, Session>();
    }    
}
