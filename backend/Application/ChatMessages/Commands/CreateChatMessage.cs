using Application.Core.Extensions;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using Dtos.Chat;
using Dtos.Users;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.ChatMessages.Commands;

public class CreateChatMessage
{
    public class Query : IRequest<ChatMessageDto>
    {
        public required string Content { get; set; }
        public required Guid ChannelId { get; set; }
        public required Guid UserId { get; set; }
        public ChatMessageType? MessageType { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, ChatMessageDto>
    {
        public async Task<ChatMessageDto> Handle(Query request, CancellationToken cancellationToken)
        {
            var message = mapper.Map<ChatMessage>(request);

            await context.ChatMessages.AddAsync(message, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);

            var userDto = await context.Users
                .Where(u => u.Id == request.UserId)
                .ProjectTo<UserDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);


            var messageDto = mapper.Map<ChatMessageDto>(message);
            messageDto.User = userDto!;

            return messageDto;
        }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator(AppDbContext context)
        {
            RuleFor(x => x.UserId)
                .Required()
                .MustExistInDb(context.Users);
            RuleFor(x => x.ChannelId)
                .Required()
                .MustExistInDb(context.ChatChannels);
            RuleFor(x => x.Content)
                .Required();
        }
    }
}