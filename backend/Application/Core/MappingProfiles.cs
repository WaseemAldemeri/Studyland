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
        CreateMap<Topic, TopicDto>();
        CreateMap<Award, AwardDto>();
        CreateMap<User, UserDto>();

        // Sessions Mappings
        CreateMap<Session, SessionDto>()
            .ForMember(dest => dest.DurationMs, opt => opt.MapFrom(src => (long)src.Duration.TotalMilliseconds));
        CreateMap<UpdateSessionDto, UpdateSession.Command>()
            .ForMember(dest => dest.Duration, opt =>
            {
                opt.Condition(src => src.DurationMs.HasValue);
                opt.MapFrom(src => TimeSpan.FromMilliseconds((double)src.DurationMs!));
            });
        CreateMap<UpdateSession.Command, Session>();
        CreateMap<CreateSessionDto, CreateSession.Command>();
        CreateMap<CreateSession.Command, Session>();
    }
}
