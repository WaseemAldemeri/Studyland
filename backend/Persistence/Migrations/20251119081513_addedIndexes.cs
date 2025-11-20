using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class addedIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sessions_UserId",
                table: "Sessions");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_ChannelId",
                table: "ChatMessages");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_UserId_StartedAt",
                table: "Sessions",
                columns: new[] { "UserId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ChannelId_Timestamp",
                table: "ChatMessages",
                columns: new[] { "ChannelId", "Timestamp" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sessions_UserId_StartedAt",
                table: "Sessions");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_ChannelId_Timestamp",
                table: "ChatMessages");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_UserId",
                table: "Sessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ChannelId",
                table: "ChatMessages",
                column: "ChannelId");
        }
    }
}
