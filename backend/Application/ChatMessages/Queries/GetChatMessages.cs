using Application.Core;
using Application.Core.Extensions;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Dtos.Chat;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.ChatMessages.Queries;

public class GetChatMessages
{
    public class Query : IRequest<List<ChatMessageDto>>
    {
        public required Guid ChannelId { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<ChatMessageDto>>
    {
        public async Task<List<ChatMessageDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var messages = await context.ChatMessages
                .Where(m => m.ChannelId == request.ChannelId)
                .OrderBy(m => m.Timestamp)
                .ProjectTo<ChatMessageDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return messages;
        }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator(AppDbContext context)
        {
            RuleFor(x => x.ChannelId)
                .Required()
                .MustExistInDb(context.ChatChannels);
        }
    }
}