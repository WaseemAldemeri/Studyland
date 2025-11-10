using Application.Accounts.Commands;
using Application.Sessions.Commands;
using Application.Stats.Queries;
using AutoMapper;
using Domain;
using Dtos.Accounts;
using Dtos.Awards;
using Dtos.Sessions;
using Dtos.Stats;
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
                opt.MapFrom(src => src.DurationMs != null ? TimeSpan.FromMilliseconds((double)src.DurationMs) : (TimeSpan?)null);
            });
        CreateMap<UpdateSession.Command, Session>();

        CreateMap<CreateSessionDto, CreateSession.Command>()
            .ForMember(dest => dest.Duration, opt => opt.MapFrom(src => TimeSpan.FromMilliseconds((double)src.DurationMs)));
        CreateMap<CreateSession.Command, Session>();


        CreateMap<GetDashboardStatsQueryDto, GetDashboardStats.Query>();

        CreateMap<RegisterRequestDto, Register.Command>();
        // username is treated as email in identity
        CreateMap<Register.Command, User>()
            .ForMember(dest => dest.UserName, opt =>
                opt.MapFrom(src => src.DisplayName)
            );

        CreateMap<LoginRequestDto, Login.Command>();
    }
}
