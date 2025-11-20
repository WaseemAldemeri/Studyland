using Application.Core.Extensions;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Dtos;
using Dtos.Chat;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.ChatMessages.Queries;

public class GetChatMessages
{
    private const int DefaultPageSize = 50;
    private const int MaxPageSize = 200;

    public class Query : IRequest<PagedList<ChatMessageDto, DateTimeOffset?>>
    {
        public required Guid ChannelId { get; set; }
        public DateTimeOffset? Cursor { get; set; }

        private int _pageSize;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value is default(int) ? DefaultPageSize : Math.Min(value, MaxPageSize);
        }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, PagedList<ChatMessageDto, DateTimeOffset?>>
    {
        public async Task<PagedList<ChatMessageDto, DateTimeOffset?>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = context.ChatMessages
                .Where(m => m.ChannelId == request.ChannelId)
                .OrderByDescending(m => m.Timestamp)
                .AsQueryable();
            
            if (request.Cursor is not null)
            {
                query = query.Where(m => m.Timestamp <= request.Cursor);
            }

            var messages = await query
                .Take(request.PageSize + 1)
                .ProjectTo<ChatMessageDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
            
            DateTimeOffset? nextCursor = null;

            if (messages.Count > request.PageSize)
            {
                nextCursor = messages.Last().Timestamp;
                messages.RemoveAt(messages.Count - 1);
            }

            return new() {Items = messages, NextCursor = nextCursor};
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